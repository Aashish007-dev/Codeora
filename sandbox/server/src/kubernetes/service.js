import { K8sCoreV1Api } from "./config.js";

export const createService = async (sanboxId) => {
    const serviceManiFest ={
        metadata: {
            name: `sandbox-service-${sanboxId}`,
            lebels: {
                app: 'sandox',
                sanboxId: sanboxId
            }
        },

        spec: {
            selector: {
                app: 'sandbox',
                sanboxId: sanboxId
            },

            ports: [
                {
                    name: 'http',
                    port: 80,
                    targetPort: 5173,
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