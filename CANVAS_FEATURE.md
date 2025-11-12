# Canvas Feature Documentation 🎨

## Overview

The **Canvas** feature adds a visual node-based workflow system to Open WebUI, enabling you to create complex multi-agent AI workflows using Google's Agent-to-Agent (A2A) protocol. With Canvas, you can connect different LLM models together, route data between them, and create sophisticated AI pipelines with a visual interface.

## What is Canvas?

Canvas is a visual programming interface that allows you to:
- **Create Agent Nodes**: Each node represents an AI agent powered by any LLM model configured in your system
- **Connect Nodes**: Draw connections between nodes to define how data flows through your workflow
- **Assign Different Models**: Each agent node can use a different LLM model (GPT-4, Claude, local models, etc.)
- **Execute Workflows**: Run your entire workflow with a single prompt and watch as data flows through your connected agents
- **View Results**: See intermediate outputs at each node and the final result in the output node

## Google Agent-to-Agent (A2A) Protocol

The Canvas feature implements Google's A2A protocol, which provides:

### Agent Cards
Each node creates an "Agent Card" containing:
- **Name**: The model name assigned to the node
- **Capabilities**: Streaming, state tracking, etc.
- **Skills**: What the agent can do (process, transform, analyze)
- **Input/Output Modes**: Supported data formats

### Task Management
- **Task Creation**: Each execution creates tasks for tracking
- **Status Tracking**: Monitor task progress (submitted, working, completed, failed)
- **Message History**: Full conversation history maintained per node
- **Artifacts**: Store and pass complex data between nodes

### Communication Flow
1. User submits input
2. Input routes to starting node(s)
3. Each node processes with its assigned model
4. Output automatically flows to connected nodes
5. Final result aggregates at output node

## Getting Started

### 1. Access Canvas
- Navigate to Open WebUI
- Click the **Canvas** icon in the sidebar (between Workspace and other options)
- You'll see an empty canvas workspace

### 2. Create Your First Workflow

**Simple 2-Node Pipeline:**

1. **Add First Agent Node**
   - Click "+ Agent Node" button
   - A new node appears on the canvas
   - Click on the node to configure it
   - Select an LLM model from the dropdown

2. **Add Second Agent Node**
   - Click "+ Agent Node" again
   - Position it to the right of the first node
   - Assign a different model to this node

3. **Connect the Nodes**
   - Hover over the first node's green circle (output handle)
   - Click and drag to the second node's blue circle (input handle)
   - You'll see a curved line connecting them

4. **Add Output Node**
   - Click "+ Output Node"
   - Position it to the right of your last agent node
   - Connect your last agent node to the output node

5. **Execute the Workflow**
   - Enter your prompt in the input panel on the right
   - Press Enter or click the arrow button
   - Watch as your prompt flows through the workflow
   - View the final result in the output node and right panel

## Canvas Controls

### Node Management
- **Add Agent Node**: Creates a new AI agent processing node
- **Add Output Node**: Creates a single output display node (max 1 per canvas)
- **Delete Node**: Click the trash icon on any node
- **Move Node**: Click and drag any node to reposition it
- **Select Node**: Click a node to select it (blue border indicates selection)

### Canvas Navigation
- **Pan**: Hold `Ctrl` (or `Cmd` on Mac) + drag the canvas background
- **Zoom**: Hold `Ctrl` (or `Cmd` on Mac) + scroll mouse wheel
- **Zoom Level**: Displayed in the top-left toolbar (e.g., "100%")

### Connections
- **Create Connection**: Drag from green output handle to blue input handle
- **Delete Connection**: Click on any connection line to remove it
- **Connection Types**:
  - Green circles = Output handles (where data comes out)
  - Blue circles = Input handles (where data goes in)

### Save/Load
- **Save Canvas**: Click the floppy disk icon in the top navigation bar
  - Downloads a JSON file with your entire canvas configuration
  - Includes nodes, connections, and settings

- **Load Canvas**: Click the folder icon in the top navigation bar
  - Upload a previously saved JSON file
  - Restores your complete workflow

## Node Types

### Agent Node
**Purpose**: Process data using an assigned LLM model

**Features**:
- Model selection dropdown
- Custom label/name
- Status indicator (gray/yellow/green/red dot)
- Output preview
- Task status display
- Both input and output handles

**Configuration**:
- **Label**: Click the text at the top to rename
- **Model**: Select from all configured models in your system
- **Status Colors**:
  - Gray: Not yet executed
  - Yellow: Currently processing
  - Green: Successfully completed
  - Red: Failed/error occurred

### Output Node
**Purpose**: Display final workflow results

**Features**:
- Single instance per canvas
- Displays aggregated output from connected nodes
- Purple/indigo gradient styling
- Results shown both in node and right panel
- Input handle only (no output)

**Behavior**:
- Collects outputs from all connected agent nodes
- Combines multiple inputs with newline separators
- Updates the right panel with final results

## Execution Flow

### How Workflows Execute

1. **Topological Sorting**: Canvas analyzes your node graph and determines execution order
2. **Starting Nodes**: Identifies nodes with no incoming connections
3. **Sequential Processing**: Executes nodes in dependency order
4. **Parallel Execution**: Nodes with no dependencies execute simultaneously
5. **Data Routing**: Each node's output automatically flows to connected nodes
6. **Output Aggregation**: Output node collects final results

### Example: Three-Node Pipeline

```
User Input: "Write a short story about AI"
    ↓
[Node 1: GPT-4] → Generates story outline
    ↓
[Node 2: Claude] → Writes full story from outline
    ↓
[Node 3: Local LLM] → Reviews and polishes
    ↓
[Output Node] → Displays final polished story
```

### Example: Parallel + Merge Pattern

```
User Input: "Research electric vehicles"
         ↓
    ┌────┴────┐
    ↓         ↓
[Node 1]   [Node 2]
(GPT-4)    (Claude)
Research   Research
pros       cons
    ↓         ↓
    └────┬────┘
         ↓
    [Node 3]
  (Synthesis)
    Combine
     both
         ↓
  [Output Node]
   Final report
```

## Use Cases

### 1. Multi-Perspective Analysis
Create nodes with different models to get diverse perspectives:
- Node 1: Technical analysis
- Node 2: Business perspective
- Node 3: User impact assessment
- Output: Comprehensive report

### 2. Iterative Refinement
Chain models for progressive improvement:
- Node 1: Generate draft
- Node 2: Review and critique
- Node 3: Revise based on feedback
- Output: Polished final version

### 3. Specialized Pipeline
Use models for their strengths:
- Node 1 (Code Model): Write code
- Node 2 (General Model): Generate documentation
- Node 3 (Review Model): Quality check
- Output: Complete package

### 4. Parallel Research
Split complex queries:
- Node 1: Research aspect A
- Node 2: Research aspect B
- Node 3: Synthesize findings
- Output: Comprehensive answer

### 5. Translation Chain
Multi-stage translation:
- Node 1: Translate to intermediate language
- Node 2: Refine translation
- Node 3: Cultural adaptation
- Output: Polished translation

## Best Practices

### Workflow Design
1. **Start Simple**: Begin with 2-3 nodes, then expand
2. **Clear Labels**: Name nodes descriptively (e.g., "Code Generator", "Code Reviewer")
3. **Model Selection**: Choose appropriate models for each task
4. **Test Incrementally**: Test small workflows before building complex ones

### Performance
1. **Limit Node Count**: Keep workflows under 10 nodes for best performance
2. **Avoid Cycles**: Don't create circular connections (will cause errors)
3. **Model Availability**: Ensure assigned models are running/available
4. **Output Node**: Always include an output node for visibility

### Organization
1. **Visual Layout**: Arrange nodes left-to-right in execution order
2. **Spacing**: Leave space between nodes for clarity
3. **Grouping**: Use canvas positioning to group related nodes
4. **Documentation**: Save different workflows with descriptive names

## Troubleshooting

### Common Issues

**Issue**: "Please add at least one agent node to the canvas"
- **Solution**: Click "+ Agent Node" to create an agent node

**Issue**: "Please assign a model to all agent nodes"
- **Solution**: Click each node and select a model from the dropdown

**Issue**: "No starting nodes found in the canvas"
- **Solution**: Ensure at least one node has no incoming connections (entry point)

**Issue**: Node shows red status indicator
- **Solution**: Check the task status message in the node, verify model is running

**Issue**: Connection won't create
- **Solution**: Ensure you're dragging from green output to blue input handle

**Issue**: Canvas is blank after loading
- **Solution**: Try zooming out (Ctrl+scroll), nodes might be off-screen

### Error Messages

**"Only one output node is allowed"**
- Delete the existing output node before adding a new one

**"Node does not have a model assigned"**
- Click the node and select a model from the dropdown

**"Failed to get response from model"**
- Verify the model is running and accessible
- Check your Ollama/OpenAI API configuration
- Review network connectivity

## Technical Details

### Data Structures

**Task Object**:
```typescript
{
  id: string;
  sessionId?: string;
  status: {
    state: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed';
    message?: string;
  };
  history: Message[];
  artifacts?: Artifact[];
  metadata?: Record<string, any>;
}
```

**Node Object**:
```typescript
{
  id: string;
  type: 'agent' | 'output';
  position: { x: number; y: number };
  data: {
    label?: string;
    modelId?: string;
    agentCard?: AgentCard;
    task?: Task;
    output?: string;
  };
}
```

**Connection Object**:
```typescript
{
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

### API Integration

Canvas uses the Open WebUI chat completions API:
```javascript
POST /api/chat/completions
{
  model: string;
  messages: Message[];
  stream: boolean;
}
```

### Storage

Canvas state is stored in:
- **Svelte Stores**: `canvasNodes`, `canvasConnections`, `canvasOutput`, `canvasExecuting`
- **Local Files**: Save/load creates JSON files on your machine
- **No Server Storage**: Canvas configurations are client-side only

## Keyboard Shortcuts

- `Ctrl/Cmd + Click` on canvas: Start panning mode
- `Ctrl/Cmd + Scroll`: Zoom in/out
- `Enter`: Execute workflow (when focused on input panel)
- `Shift + Enter`: New line in input (when focused on input panel)
- `Click on node`: Select node
- `Click on canvas`: Deselect all

## Future Enhancements

Potential future features:
- Node grouping and templates
- Conditional routing based on output
- Loop/iteration support
- More node types (filter, transform, merge)
- Collaborative canvas editing
- Version control for workflows
- Node library/marketplace
- Performance metrics per node
- Cost tracking per execution

## Contributing

To contribute to Canvas development:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Key files:
- `src/lib/components/canvas/` - Canvas components
- `src/lib/utils/canvas/a2aProtocol.ts` - A2A protocol implementation
- `src/lib/types/canvas/a2a.ts` - Type definitions
- `src/routes/(app)/canvas/+page.svelte` - Main canvas page

## Resources

- **A2A Protocol**: [GitHub Repository](https://github.com/a2aproject/A2A)
- **Open WebUI Docs**: [Documentation](https://docs.openwebui.com/)
- **Report Issues**: [GitHub Issues](https://github.com/craigmoss-so/open-webui-canvas/issues)

## License

Canvas feature follows the same license as Open WebUI. See [LICENSE](./LICENSE) for details.

---

**Created as an extension to Open WebUI** - Bringing visual workflows to AI interactions! 🎨✨
