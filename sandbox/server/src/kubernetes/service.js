import { K8sCoreV1Api } from "./config.js";

export const createService = async (sandboxId) => {
    const serviceManiFest ={
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            lebels: {
                sandboxId: sandboxId
            }
        },

        spec: {
            selector: {
                sandboxId: sandboxId
            },

            ports: [
                {
                    name: 'http',
                    port: 80,
                    targetPort: 5173,
                    protocol: 'TCP'
                },
                {
                    name: 'agent-http',
                    port: 3000,
                    targetPort: 3000,
                    protocol: 'TCP'
                }
            ],

            type: 'ClusterIP'
        }
    };

    const response = await K8sCoreV1Api.createNamespacedService({
        namespace: 'default',
        body: serviceManiFest
    });

    return response;
}


export const deleteService = async (sandboxId) => {
    const response = await K8sCoreV1Api.deleteNamespacedService({
        namespace: 'default',
        name: `sandbox-service-${sandboxId}`
    });

    return response;
}