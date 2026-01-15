# Base image with common development tools
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies and development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    ruby-full \
    ruby-dev \
    bundler \
    nodejs \
    npm \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash ubuntu

# Set user and working directory
USER ubuntu
WORKDIR /home/ubuntu

# Set up environment variables
ENV HOME=/home/ubuntu
ENV PATH=$HOME/.local/bin:$PATH

# Install global npm packages (if needed)
# RUN npm install -g <package-name>

# Note: Code will be cloned by the agent, so we don't copy it here
# Note: Gemfile and package.json dependencies will be installed by the agent
