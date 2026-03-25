/**
 * Welcome to Cloudflare Workers! This is a template for a worker script.
 *
 * - Run `npm run worker:dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run worker:deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
		const url = new URL(request.url);

		// Example: Basic routing
		if (url.pathname === "/api/hello") {
			return new Response(JSON.stringify({ message: "Hello from Acuity Financial Academy Worker!" }), {
				headers: { "content-type": "application/json" },
			});
		}

		// Example: Proxy to main app (if needed)
		// return fetch(request);

		return new Response("Welcome to the Acuity Financial Academy Worker! Use /api/hello to see more.", {
			headers: { "content-type": "text/plain" },
		});
	},
};
