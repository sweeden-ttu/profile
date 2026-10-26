#!/usr/bin/env bash
# Create a service account that can only manage the forms-engine namespace, and print a
# base64 kubeconfig for the OKE_KUBECONFIG GitHub secret. Run with your admin kubeconfig.
set -euo pipefail
NS=forms-engine
kubectl get ns "$NS" >/dev/null 2>&1 || kubectl create ns "$NS"
kubectl -n "$NS" apply -f - <<YAML
apiVersion: v1
kind: ServiceAccount
metadata: { name: ci-deployer }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: ci-deployer }
rules:
  - apiGroups: ["", "apps"]
    resources: [deployments, services, secrets, configmaps, pods, replicasets]
    verbs: [get, list, watch, create, update, patch]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: ci-deployer }
subjects: [{ kind: ServiceAccount, name: ci-deployer, namespace: $NS }]
roleRef: { kind: Role, name: ci-deployer, apiGroup: rbac.authorization.k8s.io }
---
apiVersion: v1
kind: Secret
metadata:
  name: ci-deployer-token
  annotations: { kubernetes.io/service-account.name: ci-deployer }
type: kubernetes.io/service-account-token
YAML
sleep 3
TOKEN=$(kubectl -n "$NS" get secret ci-deployer-token -o jsonpath='{.data.token}' | base64 -d)
SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
CA=$(kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
cat <<KCFG | base64 | tr -d '\n'; echo
apiVersion: v1
kind: Config
clusters: [{ name: oke, cluster: { server: "$SERVER", certificate-authority-data: "$CA" } }]
users: [{ name: ci-deployer, user: { token: "$TOKEN" } }]
contexts: [{ name: ci, context: { cluster: oke, user: ci-deployer, namespace: $NS } }]
current-context: ci
KCFG
