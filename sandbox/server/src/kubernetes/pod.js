import { K8sCoreV1Api } from "./config.js";

export async function createPod (sandboxId, projectId) {
    const podManiFest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],
            initContainers:[
                {
                    name: "init-container",
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    command: [ 'sh', '-c', 'cp -r /workspace/. /seed/' ],
                    volumeMounts:[
                        {
                            name: "workspace-volume",
                            mountPath: "/seed"
                        }
                    ]
                }
            ],
            containers: [
                {
                    image: 'template',
                    imagePullPolicy: 'IfNotPresent',
                    name: 'sandbox-container',
                    ports: [{containerPort: 5173, name: 'http'}],
                    resources: {
                        limits:{
                            cpu: "500m",
                            memory: "1Gi"
                        },
                        requests:{
                            cpu: "250m",
                            memory: "500Mi"
                        }
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: '/workspace'
                        }
                    ]
                },
                {
                    image: 'agent',
                    imagePullPolicy: 'IfNotPresent',
                    name: 'agent-container',
                    ports: [{containerPort: 3000, name: 'http'}],
                    resources: {
                        limits:{
                            cpu: "500m",
                            memory: "1Gi"
                        },
                        requests:{
                            cpu: "250m",
                            memory: "500Mi"
                        }
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: '/workspace'
                        }
                    ]

                },
                {
                    image: 'sync-agent',
                    imagePullPolicy: 'IfNotPresent',
                    name: 'sync-agent-container',
                    ports: [{containerPort: 4000, name: 'http'}],
                    resources: {
                        limits:{
                            cpu: "500m",
                            memory: "1Gi"
                        },
                        requests:{
                            cpu: "250m",
                            memory: "500Mi"
                        }
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: '/workspace'
                        }
                    ],
                    env: [
                        {
                            name: "PROJECT_ID",
                            value: projectId
                        },
                        {
                            name: "AWS_ACCESS_KEY_ID",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secret",
                                    key: "AWS_ACCESS_KEY_ID"
                                }
                            }
                        },
                        {
                            name: "AWS_SECRET_ACCESS_KEY",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secret",
                                    key: "AWS_SECRET_ACCESS_KEY"
                                }
                            }
                        },
                        {
                            name: "S3_BUCKET_NAME",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secret",
                                    key: "S3_BUCKET_NAME"
                                }
                            }
                        },
                        {
                            name: "AWS_REGION",
                            valueFrom: {
                                secretKeyRef: {
                                    name: "aws-secret",
                                    key: "AWS_REGION"
                                }
                            }
                        },
                    ]
                }
            ]
        }
    };

    const response = await K8sCoreV1Api.createNamespacedPod({
        namespace: "default",
        body: podManiFest
    });

    return response;
}


export async function deletePod (sandboxId) {
    const response = K8sCoreV1Api.deleteNamespacedPod({
        namespace: 'default',
        name: `sandbox-pod-${sandboxId}`
    }, {
        gracePeriodSeconds: 0
    });

    return response;
}