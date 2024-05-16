"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import TypingAnimation from "../components/TypingAnimation";
import React from "react";
import { ChatMessage } from "../components/chat-message";
import { Separator } from "../components/ui/separator";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getAudio, playAudio } from "../lib/audio_utils";
import { HomeRightSectionComponent } from "../components/home/right_section";
import { HomeFormComponent } from "../components/home/form";
export default function Page() {
	const [audioQueue, setAudioQueue] = useState<
		{ audio_path: string; chunk: string }[]
	>([]);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);
	const [chatLog, setChatLog] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [audioLessonEnabled, setAudioLessonEnabled] = useState(false);
	const [begunLesson, setBegunLesson] = useState(true);
	const [inputValue, setInputValue] = useState("");
	const lastMessageRef = useRef<HTMLDivElement | null>(null);
	const params = useSearchParams();

	const headers = {
		"Content-Type": "application/json",
		accept: "application/json",
	};

	useEffect(() => {
		if (lastMessageRef.current) {
			lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatLog]);

	useEffect(() => {
		begin_lesson();
	}, []);

	const begin_lesson = () => {
		setBegunLesson(true);
		setIsLoading(true);
		const url = "/api/admin/lesson";
		setIsLoading(true);
		// axios
		// 	.get(url, { params: { id: params.get("id") } })
		// 	.then((response) => {
		// 		if (response.data.data) {
		// 			const data = {
		// 				subject: response.data.data?.subject,
		// 				topic: response.data.data?.topic,
		// 				lesson_title: response.data.data?.title,
		// 				summary: response.data.data?.summary,
		// 				context: response.data.data?.context,
		// 			};
		// 			beginChat(data);
		// 		}
		// 	})
		// 	.catch((error) => {
		// 		setIsLoading(false);
		// 		console.log("error 57", error);
		// 		console.log(
		// 			"========================================================="
		// 		);
		// 	});

		//test
		const data = {
			subject: "math",
			topic: "Fraction",
			lesson_title: "Fraction Foundation",
			summary: "Fraction Foundation",
			context: "Hello, I am JianHao Tan, your math tutor for today. In this lesson, we will explore the basics of fractions. A fraction represents a part of a whole. It consists of a numerator (the top number) and a denominator (the bottom number). For example, in the fraction 1/2, 1 is the numerator and 2 is the denominator, meaning one part out of two equal parts. Let's start with a simple problem: What is 1/2 of 4?"
		};
		beginChat(data);
	};
	const handleAudio = async (text: string) => {
		if (audioLessonEnabled) {

			const sentences = text.split(/(?<=[.!?])\s+/);
			let x = 0;
			for (let i = 0; i < sentences.length; i += 2) {
				const chunk = sentences.slice(i, i + 2);
				console.log("chunk", chunk);
				console.log("----------------------------------------");
				if (chunk.length) {
					const audio_path = (await getAudio(chunk.join(" "))) || "";
					setAudioQueue((prevQueue) => [
						...prevQueue,
						{ chunk: chunk.join(" "), audio_path: audio_path },
					]);
					if (x == 0) {
						setChatLog((prev) => [...prev, { type: "bot", message: text }]);
						x += 1;
					}
					setIsLoading(false);
				}
			}
		} else {
			setChatLog((prev) => [...prev, { type: "bot", message: text }]);
			setIsLoading(false);
		}
	};
	const beginChat = async (data: any) => {
		const url = "http://127.0.0.1:8000/begin_chat ";
		setIsLoading(true);
		try {
			const response = await axios.post(url, data, { headers });
			console.log(response)
			const text = response.data.message;
			await handleAudio(text);
		} catch (error) {
			console.log("error", error);
			console.log("----------------------------------------");
		}
	};
	const isImage = (value: string | null) => {
		if (!value) return false;
		const imageRegex = /\.(png|jpg|jpeg)$/i;
		return imageRegex.test(value);
	};
	const sendChat = async (message: any) => {
		const checkImage = isImage(message)
		if (checkImage) {
			const formData = new FormData();
			formData.append('image', message); // `message` should be the image filename
			formData.append('conversation_history', JSON.stringify(chatLog));
			console.log(message)
			try {
				const response = await axios.post('http://127.0.0.1:8000/sendImage', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
		
				if (response.data) {
					const text = response.data.response;
					await handleAudio(text);
				}
			} catch (error) {
				console.error('Error uploading image:', error);
			}
		}
		const url = "http://127.0.0.1:8000/chat?message=" + message;
		setIsLoading(true);
		axios
			.post(url, { headers: headers })
			.then(async (response) => {
				console.log("chat response", response)
				if (response?.data) {
					const text = response.data.message;
					await handleAudio(text);
				}
			})
			.catch((error) => {
				setIsLoading(false);
				console.log(error);
			});
	};

	

	// plays audio.
	useEffect(() => {
		const playNextAudio = async () => {
			if (audioQueue.length > 0 && !isAudioPlaying) {
				setIsAudioPlaying(true);
				const nextAudioPath = audioQueue[0];
				await playAudio(nextAudioPath.audio_path);
				setAudioQueue((prevQueue) => prevQueue.slice(1));
				setIsAudioPlaying(false);
			}
		};
		playNextAudio();
	}, [audioQueue, isAudioPlaying]);

	const handleAudioLesson = () => {
		setAudioLessonEnabled(!audioLessonEnabled)
	}

	const handleSubmit = () => {
		setChatLog((prevChatLog) => [
			...prevChatLog,
			{ type: "user", message: inputValue },
		]);
		sendChat(inputValue);
		setInputValue("");
	};

	const containerStyle = {
		backgroundImage: `url('/chat_bg.png')`,
		height: "88vh", // Set the height as needed
		width: "100%",
	};

	return (
		<>
			<div className="flex  flex-col">
				<div className="flex justify-between p-3 bg-[#3D316F]">
					<h3 className="font-bold pt-3">Classmates</h3>
					<div className="flex space-x-8">
						<div className="flex-col ">
							<Image
								src={"/icons/Chat.png"}
								className="ml-3"
								height={24}
								width={24}
								alt={"af"}
							/>
							<span className="text-[11px]">Feedback</span>
						</div>
						<div className="flex-col">
							<Image
								src={"/icons/Close.png"}
								height={23}
								width={23}
								alt={"af"}
							/>
							<span className="text-[11px]">Exit</span>
						</div>
						<Image src={"/user_avatar.png"} height={41} width={45} alt={"af"} />
					</div>
				</div>
				<div className="flex flex-row bg-gray-100">
					<div className="w-[70%] px-2 space-y-2 h-screen overflow-hidden" style={containerStyle} >
						<div className="flex flex-col w-full">
							{isLoading && !chatLog.length ? (
								<div className="relative left-[2rem] top-[2rem] -bottom-[38rem]">
									<div className="bg-gray-300 rounded-lg p-4 text-white w-[4rem]">
										<TypingAnimation />
									</div>
								</div>
							) : chatLog.length ? (
								<div className="flex-grow pl-6 pr-1 mt-5 fixed mb-20 h-[66%] w-[76%] overflow-y-scroll">
									<div className="flex flex-col space-y-4 px-10">
										{chatLog.map((message, index) => (
											<div key={index} ref={index === chatLog.length - 1 ? lastMessageRef : null} >
												<ChatMessage message={message} />
												{index < message.length - 1 && (
													<Separator className="my-4 md:my-8" />
												)}
											</div>
										))}
										{isLoading && (
											<div className="relative left-[2rem] -top-[1rem] -bottom-[38rem]">
												<div className="bg-gray-300 rounded-lg p-4 text-white w-[4rem]">
													<TypingAnimation />
												</div>
											</div>
										)}
									</div>
								</div>
							) : null}

							<HomeFormComponent audioLessonEnabled={audioLessonEnabled} disabled={isLoading} handleSubmit={handleSubmit} inputValue={inputValue} setInputValue={setInputValue} />
						</div>
					</div>
					<HomeRightSectionComponent speaking={isAudioPlaying} audioLessonEnabled={audioLessonEnabled} onDisableSpeech={handleAudioLesson} />
				</div>
			</div>
		</>
	);
}
