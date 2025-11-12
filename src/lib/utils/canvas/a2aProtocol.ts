/**
 * Google Agent-to-Agent (A2A) Protocol Handler
 * Manages agent-to-agent communication using the A2A protocol
 */

import { v4 as uuidv4 } from 'uuid';
import type {
	Task,
	TaskStatusObject,
	Message,
	AgentCard,
	JsonRpcRequest,
	JsonRpcResponse,
	CanvasNode,
	CanvasConnection
} from '$lib/types/canvas/a2a';

/**
 * Create an Agent Card for a node with a specific model
 */
export function createAgentCard(modelId: string, modelName: string): AgentCard {
	return {
		name: modelName,
		description: `AI Agent powered by ${modelName}`,
		url: '/api/agent', // This would be the actual agent endpoint
		version: '1.0.0',
		capabilities: {
			streaming: true,
			pushNotifications: false,
			stateTransitionHistory: true
		},
		defaultInputModes: ['text/plain'],
		defaultOutputModes: ['text/plain'],
		skills: [
			{
				name: 'process',
				description: 'Process input and generate output',
				inputModes: ['text/plain'],
				outputModes: ['text/plain']
			}
		]
	};
}

/**
 * Create a new task
 */
export function createTask(input: string, sessionId?: string): Task {
	const task: Task = {
		id: uuidv4(),
		sessionId: sessionId || uuidv4(),
		status: {
			state: 'submitted',
			message: 'Task created'
		},
		history: [
			{
				role: 'user',
				parts: [{ type: 'text', text: input }],
				timestamp: Date.now()
			}
		],
		artifacts: [],
		metadata: {
			createdAt: Date.now()
		}
	};
	return task;
}

/**
 * Update task status
 */
export function updateTaskStatus(task: Task, status: TaskStatusObject): Task {
	return {
		...task,
		status
	};
}

/**
 * Add a message to task history
 */
export function addMessageToTask(task: Task, message: Message): Task {
	return {
		...task,
		history: [...(task.history || []), message]
	};
}

/**
 * Execute a single node with given input
 */
export async function executeNode(
	node: CanvasNode,
	input: string,
	chatHandler: (messages: any[], modelId: string) => Promise<string>
): Promise<string> {
	if (node.type !== 'agent') {
		throw new Error('Only agent nodes can be executed');
	}

	if (!node.data.modelId) {
		throw new Error('Node does not have a model assigned');
	}

	// Create a task for this execution
	let task = createTask(input);
	task = updateTaskStatus(task, { state: 'working', message: 'Processing...' });

	// Update node task
	node.data.task = task;

	try {
		// Execute the chat with the assigned model
		const messages = [
			{
				role: 'user',
				content: input
			}
		];

		const response = await chatHandler(messages, node.data.modelId);

		// Update task with response
		const agentMessage: Message = {
			role: 'agent',
			parts: [{ type: 'text', text: response }],
			timestamp: Date.now()
		};

		task = addMessageToTask(task, agentMessage);
		task = updateTaskStatus(task, { state: 'completed', message: 'Task completed' });

		// Update node task
		node.data.task = task;
		node.data.output = response;

		return response;
	} catch (error) {
		// Update task with error
		task = updateTaskStatus(task, {
			state: 'failed',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
		node.data.task = task;
		throw error;
	}
}

/**
 * Execute the canvas flow
 * Processes nodes in topological order based on connections
 */
export async function executeCanvasFlow(
	nodes: CanvasNode[],
	connections: CanvasConnection[],
	userInput: string,
	chatHandler: (messages: any[], modelId: string) => Promise<string>
): Promise<{ finalOutput: string; executedNodes: Map<string, string> }> {
	// Build adjacency list for the graph
	const adjacencyList = new Map<string, string[]>();
	const inDegree = new Map<string, number>();

	// Initialize all nodes
	nodes.forEach((node) => {
		adjacencyList.set(node.id, []);
		inDegree.set(node.id, 0);
	});

	// Build the graph
	connections.forEach((conn) => {
		adjacencyList.get(conn.sourceId)?.push(conn.targetId);
		inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1);
	});

	// Find starting nodes (nodes with no incoming connections)
	const queue: string[] = [];
	inDegree.forEach((degree, nodeId) => {
		if (degree === 0) {
			const node = nodes.find((n) => n.id === nodeId);
			if (node && node.type === 'agent') {
				queue.push(nodeId);
			}
		}
	});

	if (queue.length === 0) {
		throw new Error('No starting nodes found in the canvas');
	}

	// Execute nodes in topological order
	const executedNodes = new Map<string, string>();
	const processedQueue = new Set<string>();

	while (queue.length > 0) {
		const currentNodeId = queue.shift()!;

		if (processedQueue.has(currentNodeId)) {
			continue;
		}

		const currentNode = nodes.find((n) => n.id === currentNodeId);
		if (!currentNode) continue;

		// Determine input for this node
		let nodeInput = userInput;

		// If this node has incoming connections, use output from source nodes
		const incomingConnections = connections.filter((conn) => conn.targetId === currentNodeId);
		if (incomingConnections.length > 0) {
			// Combine outputs from all source nodes
			const sourceOutputs = incomingConnections
				.map((conn) => executedNodes.get(conn.sourceId))
				.filter((output) => output !== undefined);

			if (sourceOutputs.length > 0) {
				nodeInput = sourceOutputs.join('\n\n');
			}
		}

		// Execute the node
		if (currentNode.type === 'agent') {
			try {
				const output = await executeNode(currentNode, nodeInput, chatHandler);
				executedNodes.set(currentNodeId, output);
			} catch (error) {
				console.error(`Error executing node ${currentNodeId}:`, error);
				throw error;
			}
		}

		processedQueue.add(currentNodeId);

		// Add connected nodes to the queue
		const connectedNodes = adjacencyList.get(currentNodeId) || [];
		connectedNodes.forEach((nextNodeId) => {
			const currentInDegree = inDegree.get(nextNodeId) || 0;
			inDegree.set(nextNodeId, currentInDegree - 1);

			// Add to queue if all dependencies are satisfied
			if (inDegree.get(nextNodeId) === 0 && !processedQueue.has(nextNodeId)) {
				queue.push(nextNodeId);
			}
		});
	}

	// Find the output node
	const outputNode = nodes.find((n) => n.type === 'output');
	let finalOutput = '';

	if (outputNode) {
		// Get outputs from nodes connected to the output node
		const outputConnections = connections.filter((conn) => conn.targetId === outputNode.id);
		const outputResults = outputConnections
			.map((conn) => executedNodes.get(conn.sourceId))
			.filter((output) => output !== undefined);

		finalOutput = outputResults.join('\n\n');
		outputNode.data.output = finalOutput;
	} else {
		// If no output node, use the last executed node's output
		const lastOutput = Array.from(executedNodes.values()).pop();
		finalOutput = lastOutput || '';
	}

	return { finalOutput, executedNodes };
}

/**
 * Create a JSON-RPC request
 */
export function createJsonRpcRequest(method: string, params?: any): JsonRpcRequest {
	return {
		jsonrpc: '2.0',
		method,
		params,
		id: uuidv4()
	};
}

/**
 * Create a JSON-RPC response
 */
export function createJsonRpcResponse(
	id: string | number,
	result?: any,
	error?: { code: number; message: string; data?: any }
): JsonRpcResponse {
	return {
		jsonrpc: '2.0',
		result,
		error,
		id
	};
}
