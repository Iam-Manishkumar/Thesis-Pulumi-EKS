import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { vpcId, subnetId1, subnetId2, awsRegion, instanceProfile, instanceType, diskSize, clusterName, nodeGroupName, capacityType, desiredSize, maxSize, minSize, principalArn, policyArn } from "./variables";

interface PolicyAttachment {
    policyArn: string;
    role: aws.iam.Role;
}

function createRoleWithPolicy(name: string, service: string, policies: string[]): aws.iam.Role {
    const role = new aws.iam.Role(name, {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Effect: "Allow",
                Principal: { Service: service },
                Action: "sts:AssumeRole",
            }],
        }),
    });

    policies.forEach((policyArn, index) => {
        new aws.iam.RolePolicyAttachment(`${name}-policy-${index}`, {
            policyArn,
            role: role.name,
        });
    });

    return role;
}

const masterRole = createRoleWithPolicy("pulumiMaster", "eks.amazonaws.com", [
    "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
    "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController",
]);

const workerRole = createRoleWithPolicy("pulumiWorker", "ec2.amazonaws.com", [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
]);

const workerInstanceProfile = new aws.iam.InstanceProfile("eksWorkerProfile", {
    role: workerRole.name,
});

const eksCluster = new aws.eks.Cluster(clusterName, {
    name: clusterName,
    roleArn: masterRole.arn,
    vpcConfig: {
        subnetIds: [subnetId1, subnetId2],
    },
    accessConfig: {
        authenticationMode: "API_AND_CONFIG_MAP",
        bootstrapClusterCreatorAdminPermissions: true,
    },
});

const eksNodeGroup = new aws.eks.NodeGroup(nodeGroupName, {
    clusterName: eksCluster.name,
    nodeRoleArn: workerRole.arn,
    subnetIds: [subnetId1, subnetId2],
    capacityType: capacityType,
    diskSize: parseInt(diskSize),
    instanceTypes: [instanceType],
    scalingConfig: {
        desiredSize: parseInt(desiredSize),
        maxSize: parseInt(maxSize),
        minSize: parseInt(minSize),
    },
});

const example = new aws.eks.AccessEntry("IAM", {
    clusterName: eksCluster.name,
    principalArn: principalArn,
    type: "STANDARD",
});

const accessPolicyAssociation = new aws.eks.AccessPolicyAssociation("eks", {
    clusterName: eksCluster.name,
    policyArn: policyArn,
    principalArn: principalArn,
    accessScope: {
        type: "cluster",
    },
});