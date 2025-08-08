# Kubernetes Deployment for Docs

This document describes the Kubernetes deployment configuration for the docs application.

## Kubernetes Setup

The docs application can be deployed to a Kubernetes cluster using the provided configuration in `k8s-deployment.yml`. This configuration includes:

1. A **Deployment** resource that manages the docs application pods
2. A **Service** resource that exposes the application to the network

### Deployment Configuration

The Deployment resource is configured with:

- 1 replica of the application
- Container port 3000 exposed
- NODE_ENV set to "production"
- Health monitoring via liveness and readiness probes

#### Health Monitoring

The application includes Kubernetes health monitoring with:

```yaml
livenessProbe:
  httpGet:
    port: 3000
    path: /
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:
  httpGet:
    port: 3000
    path: /
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 2
```

- **livenessProbe**: Checks if the application is running. If this probe fails, Kubernetes will restart the container.
- **readinessProbe**: Checks if the application is ready to receive traffic. If this probe fails, the pod will be removed from service endpoints.

### Service Configuration

The Service resource is configured to:

- Expose the application on port 80
- Forward traffic to the container's port 3000
- Use ClusterIP type for internal Kubernetes networking

## Deploying to Kubernetes

To deploy the application to a Kubernetes cluster:

1. Make sure you have `kubectl` installed and configured to connect to your cluster

2. Apply the Kubernetes configuration:
   ```bash
   kubectl apply -f docs/k8s-deployment.yml
   ```

3. Verify the deployment:
   ```bash
   kubectl get deployments
   kubectl get pods
   kubectl get services
   ```

## Environment Variables

For the application to function correctly in Kubernetes, you'll need to provide environment variables. You can modify the `k8s-deployment.yml` file to include the necessary environment variables:

```yaml
env:
- name: NODE_ENV
  value: "production"
- name: OPENAI_API_KEY
  valueFrom:
    secretKeyRef:
      name: docs-secrets
      key: openai-api-key
# Add other environment variables as needed
```

### Using Kubernetes Secrets

For sensitive information like API keys, it's recommended to use Kubernetes Secrets:

1. Create a Secret:
   ```bash
   kubectl create secret generic docs-secrets \
     --from-literal=openai-api-key=your-api-key \
     --from-literal=airtable-api-key=your-api-key
   ```

2. Reference the Secret in your deployment as shown above

## Troubleshooting

### Common Issues and Solutions

#### 1. Pods Not Starting

If pods are not starting, check the pod status and logs:
```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

#### 2. Health Probes Failing

If health probes are failing:
- Verify the application is running on port 3000
- Check that the application responds to HTTP requests at the root path (/)
- Increase the initialDelaySeconds if the application takes longer to start

#### 3. Service Not Accessible

If the service is not accessible:
- Verify the service is created: `kubectl get services`
- Check the service endpoints: `kubectl get endpoints`
- Ensure the selector matches the pod labels

## Scaling the Application

To scale the application, you can modify the number of replicas:

```bash
kubectl scale deployment cxs-utils-docs --replicas=3
```

Or update the `replicas` field in the `k8s-deployment.yml` file and reapply it.