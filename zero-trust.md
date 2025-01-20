# Implementing Zero-Trust Security in Cloud-Native Apps

This guide demonstrates how to implement a comprehensive zero-trust security model in cloud-native applications. Zero-trust assumes no implicit trust, requiring all access to be authenticated, authorized, and continuously validated, regardless of where the request originates.

## Prerequisites
- EKS cluster running
- Istio installed
- HashiCorp Vault
- AWS Certificate Manager
- AWS IAM authentication configured

## Service Mesh Implementation
A service mesh provides the foundation for zero-trust by managing service-to-service communication, enforcing mutual TLS, and implementing fine-grained access controls.

### 1. Istio Installation
Istio serves as our service mesh, providing essential security features like mutual TLS, authentication, and authorization policies.

```bash
istioctl install --set profile=demo -y
```

Key features enabled:
- Automatic mTLS between services
- Traffic encryption
- Identity-based authentication
- Fine-grained access control

### 2. Sidecar Injection
Istio uses sidecars (Envoy proxies) to intercept and secure all service communication. This configuration enables automatic sidecar injection for our application namespace.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: application
  labels:
    istio-injection: enabled
```

Benefits:
- Transparent security layer
- No application code changes needed
- Consistent policy enforcement
- Traffic monitoring and logging

### 3. Authentication Policy
Authentication policies define who can access services. This example shows a policy that restricts access to specific service accounts and HTTP methods.

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: httpbin-policy
  namespace: application
spec:
  selector:
    matchLabels:
      app: httpbin
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/sleep"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/info*"]
```

Policy features:
- Principal-based access control
- Method-level restrictions
- Path-based permissions
- Source identity validation

## Secret Management
Secure secret management is crucial in a zero-trust environment. HashiCorp Vault provides centralized secret storage with access control and automatic rotation.

### 1. Vault Setup
This configuration establishes a secure key-value store in Vault with version control and strict access policies.

```hcl
provider "vault" {
  address = "https://vault.example.com:8200"
}

resource "vault_mount" "kvv2" {
  path        = "kvv2"
  type        = "kv"
  options     = { version = "2" }
  description = "KV Version 2 secret engine mount"
}

resource "vault_policy" "app_policy" {
  name = "app-policy"

  policy = <<EOT
path "kvv2/data/application/*" {
  capabilities = ["read"]
}
EOT
}
```

Security features:
- Version 2 KV store for secret versioning
- Fine-grained access policies
- Audit logging
- Encryption at rest

### 2. Secret Rotation Configuration
Automated secret rotation reduces the risk of compromised credentials. This setup integrates Vault with Kubernetes for secure secret injection.

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-database
spec:
  provider: vault
  parameters:
    vaultAddress: "https://vault.example.com"
    roleName: "database-role"
    objects: |
      - objectName: "db-password"
        secretPath: "kvv2/data/application/database"
        secretKey: "password"
```

Benefits:
- Automatic secret rotation
- Secure secret injection
- No secrets in application code
- Centralized secret management

## Network Policy Implementation
Network policies enforce the zero-trust principle at the network level by explicitly defining allowed communications.

### 1. Default Deny Policy
Start with a default deny policy that blocks all traffic unless explicitly allowed. This is a fundamental zero-trust principle.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

Security impact:
- Implicit deny by default
- Reduced attack surface
- Clear traffic visibility
- Enforced segmentation

### 2. Allowed Communications
Explicitly define allowed network paths based on service identity and business requirements.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

Policy features:
- Label-based selection
- Port-level control
- Protocol restrictions
- Namespace isolation

## Identity and Access Management
IAM ensures that every service has a unique identity and minimal required permissions.

### 1. AWS IAM Role Configuration
Define precise IAM roles for services that need to interact with AWS resources.

```hcl
resource "aws_iam_role" "eks_pod_role" {
  name = "eks-pod-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}
```

Security principles:
- Least privilege access
- Role-based access control
- Service identity binding
- Temporary credentials

### 2. Service Account Setup
Kubernetes service accounts are bound to AWS IAM roles, providing secure cloud resource access.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: application-sa
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/eks-pod-role
```

Features:
- IAM role integration
- Pod identity management
- Credential rotation
- Access auditing

## Compliance Monitoring
Continuous compliance monitoring ensures adherence to security policies and quick detection of violations.

### 1. OPA Gatekeeper Installation
Open Policy Agent (OPA) Gatekeeper enforces custom policies across the cluster.

```bash
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.7/deploy/gatekeeper.yaml
```

Benefits:
- Policy as code
- Admission control
- Custom constraints
- Compliance reporting

### 2. Constraint Template
Define and enforce organizational policies using declarative constraints.

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          input.review.object.kind == "Deployment"
          not input.review.object.metadata.labels.owner
          msg := "Deployment must have owner label"
        }
```

Template features:
- Custom policy rules
- Resource validation
- Label enforcement
- Deployment controls

## Monitoring and Alerting
Comprehensive monitoring ensures quick detection and response to security events.

### 1. Prometheus Rules
Define alerting rules for security-relevant events and metrics.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: security-alerts
spec:
  groups:
  - name: security
    rules:
    - alert: UnauthorizedAccess
      expr: rate(istio_requests_total{response_code="403"}[5m]) > 10
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: High rate of unauthorized access attempts
```

Alert capabilities:
- Real-time detection
- Custom thresholds
- Security event correlation
- Automated notifications

## Incident Response Plan

1. Detection procedures
2. Containment strategy
3. Evidence collection process
4. Communication templates
5. Recovery procedures

## Security Testing

### 1. Automated Security Scanning
```yaml
name: Security Scan

on:
  push:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'table'
          severity: 'CRITICAL,HIGH'
```

## Compliance Documentation

1. Access control matrix
2. Data flow diagrams
3. Security controls inventory
4. Risk assessment reports
5. Compliance checklist