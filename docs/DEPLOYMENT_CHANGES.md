# Deployment Changes Documentation

## Changes Made

### 1. Docker Image Tagging Strategy

We've updated the Docker image tagging strategy in the GitHub Actions workflow to use both a unique tag based on the GitHub SHA and the 'latest' tag:

```yaml
tags: |
  quicklookup/cxs-utils:${{ env.SHORT_SHA }}
  quicklookup/cxs-utils:latest
```

Where `SHORT_SHA` is the first 4 characters of the GitHub commit SHA.

### 2. Kubernetes Deployment Configuration

We've updated the Kubernetes deployment configuration to reference the correct Docker image:

```yaml
containers:
- name: cxs-utils-docs
  image: quicklookup/cxs-utils:latest
```

## Impact on Deployment Process

These changes have the following impact on the deployment process:

1. **Improved Traceability**: Each Docker image build now has a unique tag based on the GitHub commit SHA, making it easier to trace which code version is deployed.

2. **Kubernetes Compatibility**: The Kubernetes deployment still uses the 'latest' tag, which ensures compatibility with the existing deployment process.

3. **Forced Updates**: Kubernetes will now properly detect when a new image is available because each build has a unique tag. This addresses the issue where Kubernetes might not pull a new image if the tag hasn't changed.

## Deployment Process

The deployment process remains the same:

1. Push changes to the main branch, which triggers the GitHub Actions workflow.
2. The workflow builds and pushes the Docker image with both the SHA-based tag and 'latest' tag.
3. Apply the Kubernetes configuration using:
   ```bash
   kubectl apply -f docs/k8s-deployment.yml
   ```

## Rollback Process

If you need to rollback to a previous version:

1. Find the SHA-based tag of the version you want to rollback to.
2. Update the k8s-deployment.yml file to reference that specific tag:
   ```yaml
   containers:
   - name: cxs-utils-docs
     image: quicklookup/cxs-utils:a1b2  # Replace with the specific SHA-based tag
   ```
3. Apply the updated configuration:
   ```bash
   kubectl apply -f docs/k8s-deployment.yml
   ```

## Future Considerations

For future improvements, consider:

1. Automating the Kubernetes deployment as part of the GitHub Actions workflow.
2. Implementing a more sophisticated versioning strategy, such as semantic versioning.
3. Setting up a staging environment for testing before deploying to production.