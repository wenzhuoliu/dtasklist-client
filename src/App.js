import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// 替换为你部署的合约地址
const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

// 替换为你合约的 ABI (我们稍后会获取)
const contractABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "creator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "taskId",
				type: "uint256",
			},
		],
		name: "TaskCompleted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "creator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "taskId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "content",
				type: "string",
			},
		],
		name: "TaskCreated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "creator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "taskId",
				type: "uint256",
			},
		],
		name: "TaskDeleted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "creator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "taskId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "content",
				type: "string",
			},
		],
		name: "TaskUpdated",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "_content",
				type: "string",
			},
		],
		name: "createTask",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_taskId",
				type: "uint256",
			},
		],
		name: "deleteTask",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "taskId",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "newContent",
				type: "string",
			},
		],
		name: "editTask",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "getMyTasks",
		outputs: [
			{
				components: [
					{
						internalType: "string",
						name: "content",
						type: "string",
					},
					{
						internalType: "bool",
						name: "isCompleted",
						type: "bool",
					},
					{
						internalType: "address",
						name: "creator",
						type: "address",
					},
				],
				internalType: "struct DTaskList.Task[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_taskId",
				type: "uint256",
			},
		],
		name: "markAsDone",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "userTasks",
		outputs: [
			{
				internalType: "string",
				name: "content",
				type: "string",
			},
			{
				internalType: "bool",
				name: "isCompleted",
				type: "bool",
			},
			{
				internalType: "address",
				name: "creator",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

function App() {
	const [walletAddress, setWalletAddress] = useState(null);
	const [contract, setContract] = useState(null);
	const [newTaskContent, setNewTaskContent] = useState("");
	const [tasks, setTasks] = useState([]);
	const [editingTaskId, setEditingTaskId] = useState(null);
	const [editText, setEditText] = useState("");

	const fetchTasks = async () => {
		if (contract && walletAddress) {
			try {
				const taskList = await contract.getMyTasks();
				setTasks(taskList);
				console.log("Tasks fetched:", taskList);
			} catch (error) {
				console.error("Error fetching tasks:", error);
			}
		}
	};

	async function connectToLocalNetwork() {
		try {
			const provider = new ethers.JsonRpcProvider("http://localhost:8545");
			const signer = await provider.getSigner();
			setWalletAddress(await signer.getAddress());
			const dTaskListContract = new ethers.Contract(contractAddress, contractABI, signer);
			setContract(dTaskListContract);
		} catch (error) {
			console.error("Could not connect to Hardhat local network:", error);
		}
	}

	const handleCreateTask = async () => {
		if (!contract) {
			console.error("Contract not connected!");
			return;
		}

		try {
			const transaction = await contract.createTask(newTaskContent);
			console.log("Creating task...", transaction.hash);
			await transaction.wait(); // 等待交易被确认
			console.log("Task created successfully!");
			setNewTaskContent(""); // 清空输入框
			// 在这里可以触发重新获取任务列表的操作
			fetchTasks();
		} catch (error) {
			console.error("Error creating task:", error);
		}
	};

	const handleMarkAsDone = async (taskId) => {
		if (!contract) {
			console.error("Contract not connected!");
			return;
		}

		try {
			const transaction = await contract.markAsDone(taskId);
			console.log(`Marking task ${taskId} as done...`, transaction.hash);
			await transaction.wait(); // 等待交易被确认
			console.log(`Task ${taskId} marked as done successfully!`);
			// 重新获取任务列表以更新 UI
			fetchTasks();
		} catch (error) {
			console.error(`Error marking task ${taskId} as done:`, error);
		}
	};

	const handleDeleteTask = async (taskId) => {
		if (!contract) {
			console.error("Contract not connected!");
			return;
		}

		try {
			const transaction = await contract.deleteTask(taskId);
			console.log(`Deleting task ${taskId}...`, transaction.hash);
			await transaction.wait(); // 等待交易被确认
			console.log(`Task ${taskId} deleted successfully!`);
			// 重新获取任务列表以更新 UI
			fetchTasks();
		} catch (error) {
			console.error(`Error deleting task ${taskId}:`, error);
		}
	};

	const handleSaveEdit = async (taskId) => {
		if (!contract) {
			console.error("Contract not connected!");
			return;
		}

		try {
			const transaction = await contract.editTask(taskId, editText);
			console.log(`Editing task ${taskId} to: ${editText}...`, transaction.hash);
			await transaction.wait(); // 等待交易被确认
			console.log(`Task ${taskId} edited successfully!`);
			setEditingTaskId(null); // 退出编辑模式
			setEditText(""); // 清空编辑框
			fetchTasks(); // 重新获取任务列表以更新 UI
		} catch (error) {
			console.error(`Error editing task ${taskId}:`, error);
		}
	};

	useEffect(() => {
		if (contract && walletAddress) {
			fetchTasks();
		}
	}, [contract, walletAddress]);

	return (
		<div className="App">
			<header className="App-header">
				<h1>Decentralized Task List</h1>
				{walletAddress ? (
					<>
						<p>walletAddress: {walletAddress}</p>
						<p>contractAddress: {contract.target}</p>
					</>
				) : (
					<button onClick={() => connectToLocalNetwork()}>Connect</button>
				)}
				<button onClick={() => fetchTasks()}>Fetch tasks</button>
			</header>
			<div>
				<h2>Create New Task</h2>
				<input
					type="text"
					placeholder="Enter task content"
					value={newTaskContent}
					onChange={(e) => setNewTaskContent(e.target.value)}
				/>
				<button onClick={handleCreateTask} disabled={!contract}>
					Create Task
				</button>
			</div>
			<div>
				<h2>Task List</h2>
				{tasks.length > 0 ? (
					<ul>
						{tasks.map((task, index) => (
							<li key={index}>
								{editingTaskId === index ? (
									<>
										<input
											type="text"
											value={editText}
											onChange={(e) => setEditText(e.target.value)}
										/>
										<button onClick={() => handleSaveEdit(index)} disabled={!contract}>
											Save
										</button>
										<button onClick={() => setEditingTaskId(null)}>Cancel</button>
									</>
								) : (
									<>
										{task.content} - {task.isCompleted ? "Completed" : "Pending"}
										{!task.isCompleted && (
											<button onClick={() => handleMarkAsDone(index)} disabled={!contract}>
												Mark as Done
											</button>
										)}
										<button
											onClick={() => {
												setEditingTaskId(index);
												setEditText(task.content);
											}}
											disabled={!contract}
										>
											Edit
										</button>
										<button onClick={() => handleDeleteTask(index)} disabled={!contract}>
											Delete
										</button>
									</>
								)}
							</li>
						))}
					</ul>
				) : (
					<p>No tasks yet.</p>
				)}
			</div>
		</div>
	);
}

export default App;
