# Master Thesis

This repository contains code for deploying an Amazon EKS (Elastic Kubernetes Service) cluster using Pulumi, version 6.32.0, with TypeScript. This project is a part of the Master's thesis conducted at KTH Royal Institute of Technology, Sweden, and Aalto University, Finland.

## Getting Started

To get started with deploying the EKS cluster using Pulumi, follow the steps below:

### 1. Update `variables.ts`

In the `variables.ts` file, ensure all necessary variables are set according to your environment and requirements. This includes values such as VPC ID, subnet IDs, AWS region, instance profiles, instance types, disk sizes, cluster names, node group names, capacity types, desired sizes, max sizes, min sizes, principal ARNs, and policy ARNs.

### 2. Set the Remote Backend

Configure the Pulumi project to use a remote backend for storing state. This could be an S3 bucket, Azure Blob Storage, or any other supported backend. Ensure that your credentials are properly configured for accessing the remote backend.

### 3. Preview the Changes

Before deploying the infrastructure, it's a good practice to preview the changes to ensure everything looks correct. Run the following command:

```bash
pulumi preview
pulumi up
pulumi destroy
