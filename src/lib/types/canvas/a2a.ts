/**
 * Google Agent-to-Agent (A2A) Protocol Types
 * Based on the A2A Protocol specification v0.3
 */

// Task status states
export type TaskStatus = 'submitted' | 'working' | 'input-required' | 'completed' | 'failed';

// Task status object
export interface TaskStatusObject {
	state: TaskStatus;
	message?: string;
}

// Message part types
export interface TextPart {
	type: 'text';
	text: string;
}

export interface FilePart {
	type: 'file';
	url: string;
	mimeType?: string;
}

export type MessagePart = TextPart | FilePart;

// Message object
export interface Message {
	role: 'user' | 'agent' | 'system';
	parts: MessagePart[];
	timestamp?: number;
}

// Artifact object
export interface Artifact {
	id: string;
	name: string;
	mimeType: string;
	data: string;
	metadata?: Record<string, any>;
}

// Task object
export interface Task {
	id: string;
	sessionId?: string;
	status: TaskStatusObject;
	history?: Message[];
	artifacts?: Artifact[];
	metadata?: Record<string, any>;
}

// Agent skill definition
export interface AgentSkill {
	name: string;
	description: string;
	inputModes?: string[];
	outputModes?: string[];
	parameters?: Record<string, any>;
}

// Agent capabilities
export interface AgentCapabilities {
	streaming?: boolean;
	pushNotifications?: boolean;
	stateTransitionHistory?: boolean;
}

// Agent provider information
export interface AgentProvider {
	name: string;
	organization?: string;
	url?: string;
}

// Agent Card - JSON metadata describing an agent
export interface AgentCard {
	name: string;
	description?: string;
	url: string;
	provider?: AgentProvider;
	version: string;
	documentationUrl?: string;
	capabilities?: AgentCapabilities;
	authentication?: {
		type: string;
		[key: string]: any;
	};
	defaultInputModes?: string[];
	defaultOutputModes?: string[];
	skills: AgentSkill[];
}

// JSON-RPC 2.0 request
export interface JsonRpcRequest {
	jsonrpc: '2.0';
	method: string;
	params?: any;
	id: string | number;
}

// JSON-RPC 2.0 response
export interface JsonRpcResponse {
	jsonrpc: '2.0';
	result?: any;
	error?: {
		code: number;
		message: string;
		data?: any;
	};
	id: string | number;
}

// A2A Protocol Methods
export type A2AMethod =
	| 'agent.getCard'
	| 'task.create'
	| 'task.update'
	| 'task.get'
	| 'task.cancel'
	| 'task.list';

// Canvas-specific node types
export type NodeType = 'agent' | 'output';

// Canvas node interface
export interface CanvasNode {
	id: string;
	type: NodeType;
	position: { x: number; y: number };
	data: {
		label?: string;
		modelId?: string; // For agent nodes
		agentCard?: AgentCard;
		task?: Task;
		output?: string;
	};
}

// Canvas connection interface
export interface CanvasConnection {
	id: string;
	sourceId: string;
	targetId: string;
	sourceHandle?: string;
	targetHandle?: string;
}

// Canvas state interface
export interface CanvasState {
	nodes: CanvasNode[];
	connections: CanvasConnection[];
	executing: boolean;
	output: string | null;
}
