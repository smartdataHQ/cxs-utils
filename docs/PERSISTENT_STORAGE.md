# Persistent Storage for Documentation Files

## Overview

This document explains how the application is configured to add new files to the documentation directory (`/app/data/event-bible/documentation`) as needed, and how those files persist across container restarts and deployments.

## Docker Configuration

### File Permissions

In the Dockerfile, we ensure the application has write permissions to the documentation directory:

1. The directory is created with: `RUN mkdir -p /app/data/event-bible/documentation`
2. Ownership is set to the `nextjs` user: `RUN chown -R nextjs:nodejs /app`
3. The application runs as the `nextjs` user: `USER nextjs`

This configuration ensures the application has the necessary permissions to create and modify files in the documentation directory.

### Persistent Storage in Docker Compose

For local development using Docker Compose, persistent storage is configured with a volume mount:

```yaml
volumes:
  - docs-data:/app/data
```

This mounts a named volume `docs-data` to the `/app/data` directory in the container, ensuring that files written to this directory (including the documentation subdirectory) persist across container restarts.

## Kubernetes Configuration

For production deployment in Kubernetes, we've added persistent storage configuration to ensure files persist across pod restarts and replacements:

1. A volume mount in the container specification:
   ```yaml
   volumeMounts:
   - name: docs-data
     mountPath: /app/data
   ```

2. A volume definition at the pod level:
   ```yaml
   volumes:
   - name: docs-data
     persistentVolumeClaim:
       claimName: cxs-utils-docs-pvc
   ```

3. A PersistentVolumeClaim (PVC) that requests storage from the cluster:
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: cxs-utils-docs-pvc
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 1Gi
     storageClassName: standard
   ```

This configuration ensures that files written to the `/app/data` directory (including the documentation subdirectory) persist across pod restarts and replacements in the Kubernetes environment.

## Conclusion

With these configurations in place, the application will be able to add new files to the documentation directory as needed, and those files will persist across container restarts and deployments in both Docker Compose and Kubernetes environments.

The key components that enable this functionality are:

1. Proper file permissions (the application runs as a user that owns the directory)
2. Volume mounts in both Docker Compose and Kubernetes
3. Persistent storage provisioning through Kubernetes' PersistentVolumeClaim

These changes ensure that the documentation directory can be used as a reliable storage location for dynamically generated documentation files.