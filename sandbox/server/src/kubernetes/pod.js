import { K8sCoreV1Api } from "./config.js";

export async function createPod (sanboxId) {
    const podManiFest = {
        metadata: {
            name: `sandbox-pod-${sanboxId}`,
            labels: {
                app: 'sandbox',
                sanboxId: sanboxId
            }
        },
        spec: {
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
                    }
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