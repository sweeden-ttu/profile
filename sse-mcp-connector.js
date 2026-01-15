/**
 * SSE MCP (Model Context Protocol) Connector for GitHub Pages
 * 
 * This connector enables real-time communication between MCP servers
 * and web applications using Server-Sent Events (SSE) on GitHub Pages.
 * 
 * Features:
 * - SSE client for receiving MCP events
 * - MCP tool execution via HTTP requests
 * - Auto-reconnection and error handling
 * - GitHub Pages compatible (no server-side code needed)
 */

class SSEMCPConnector {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:3001';
        this.clientId = config.clientId || 'github-pages-client';
        this.reconnectInterval = config.reconnectInterval || 5000;
        this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
        
        this.eventSource = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.messageHandlers = new Map();
        this.messageId = 0;
        this.pendingRequests = new Map();
        
        // Bind event handlers
        this.handleMessage = this.handleMessage.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
    }

    /**
     * Initialize connection to MCP server via SSE
     */
    async connect() {
        try {
            console.log('📡 Connecting to MCP server via SSE:', this.baseUrl);
            
            // First, validate the MCP server is running
            await this.validateMCPProxy();
            
            // Create SSE connection
            const sseUrl = `${this.baseUrl}/message?sessionId=${this.clientId}`;
            this.eventSource = new EventSource(sseUrl);

            // Set up event handlers
            this.eventSource.onmessage = this.handleMessage;
            this.eventSource.onerror = this.handleError;
            this.eventSource.onopen = this.handleOpen;
            
        } catch (error) {
            console.error('❌ Failed to connect:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Validate that MCP proxy is accessible
     */
    async validateMCPProxy() {
        try {
            const response = await fetch(`${this.baseUrl}/status`);
            if (!response.ok) {
                throw new Error(`MCP proxy unavailable: ${response.status}`);
            }
            const status = await response.json();
            console.log('✅ MCP proxy status:', status);
        } catch (error) {
            throw new Error(`Failed to connect to MCP proxy: ${error.message}`);
        }
    }

    /**
     * Handle incoming SSE messages
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 Received message:', data);

            // Handle different message types
            switch (data.type) {
                case 'tools/list':
                    this.handleToolsList(data);
                    break;
                case 'call_tool':
                    this.handleCallToolResponse(data);
                    break;
                case 'message':
                    this.handleGenericMessage(data);
                    break;
                default:
                    console.log('📝 Unknown message type:', data.type);
            }

            // Route to registered handlers
            const handlers = this.messageHandlers.get(data.type);
            if (handlers) {
                handlers.forEach(handler => handler(data));
            }

        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    }

    /**
     * Handle SSE connection errors
     */
    handleError(error) {
        console.error('🔥 SSE connection error:', error);
        this.isConnected = false;
        
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        this.scheduleReconnect();
    }

    /**
     * Handle SSE connection open
     */
    handleOpen(event) {
        console.log('🚀 SSE connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send initial connection message
        this.sendMessage({ type: 'connect', clientId: this.clientId });
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Reattempting connection in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);\n        
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }

    /**
     * Register message handler for specific message types
     */
    onMessage(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, [handler]);
        } else {
            this.messageHandlers.get(messageType).push(handler);
        }
    }

    /**
     * Send message to MCP server
     */
    async sendMessage(message) {
        try {
            const response = await fetch(`${this.baseUrl}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...message,
                    sessionId: this.clientId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    /**
     * Call an MCP tool
     */
    async callTool(toolName, parameters = {}) {
        const messageId = this.generateMessageId();
        
        try {
            // Create promise for response
            const responsePromise = new Promise((resolve, reject) => {
                this.pendingRequests.set(messageId, { resolve, reject, timestamp: Date.now() });
            });

            // Send tool call request
            await this.sendMessage({
                type: 'call_tool',
                id: messageId,
                name: toolName,
                parameters: parameters
            });

            // Wait for response with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tool call timeout')), 30000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            return result;

        } catch (error) {
            console.error('❌ Tool call failed:', error);
            this.pendingRequests.delete(messageId);
            throw error;
        }
    }

    /**
     * List available tools
     */
    async listTools() {
        try {
            const response = await this.sendMessage({ type: 'tools/list' });
            return response.tools || [];
        } catch (error) {
            console.error('❌ Failed to list tools:', error);
            return [];
        }
    }

    /**
     * Get system information
     */
    async getSystemInfo() {
        try {
            const response = await this.sendMessage({ type: 'system/info' });
            return response;
        } catch (error) {
            console.error('❌ Failed to get system info:', error);
            return null;
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        console.log('👋 Disconnecting from MCP server');
        
        if (this.eventSource) {
            this.eventSource.close();
        }
        
        this.isConnected = false;
        this.pendingRequests.clear();
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `github-pages-${++this.messageId}`;
    }

    /**
     * Handle specific message types
     */
    handleToolsList(data) {
        console.log('🛠️  Tools available:', data.tools);
    }

    handleCallToolResponse(data) {
        console.log('⚙️  Tool call response:', data);
    }

    handleGenericMessage(data) {
        console.log('💬 Generic message:', data);
    }
}

// Export for use in other scripts 
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { SSEMCPConnector };
}