"use client"

import 'regenerator-runtime'
import { useRef,useState } from 'react';
import { MicrophoneComponent } from "../audio/microphone";
import pin from "./pin.png"
import Image from 'next/image';
interface HomeFormComponentProps {
	handleSubmit: () => void;
	inputValue: string;
	disabled: boolean;
	audioLessonEnabled: boolean;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export function HomeFormComponent({
	handleSubmit,
	inputValue,
	disabled,
	audioLessonEnabled,
	setInputValue,
}: HomeFormComponentProps) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const keyDownEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key == 'Enter') {
			handleSubmit()
		}
	}
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target?.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setSelectedImage(file.name);
				setInputValue(file.name); // Store the image base64 string in inputValue
			};
			reader.readAsDataURL(file);

			await handleImageUpload(file); // Upload the image immediately
		}
	};

	const handleImageUpload = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('http://127.0.0.1:8000/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error('Failed to upload image');
			}

			const data = await response.json();
			console.log('Image uploaded successfully:', data);
		} catch (error) {
			console.error('Error uploading image:', error);
		}
	};

	return (
		<div className="fixed bottom-1 w-[76%] flex-none p-6">
			<div className="flex rounded border bg-white border-red-100">
            <Image src={pin} style={{height:"2rem",margin:"auto",cursor:"pointer"}} width={30} alt="File Pin" className="mr-3"	onClick={handleImageClick} />
				
				<input
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					ref={fileInputRef}
					onChange={handleImageChange}
				/>
				<input
					disabled={disabled}
					type="text"
					className="flex-grow px-4 py-2 bg-white h-[42px] text-gray-600 focus:outline-none"
					placeholder="Type your message..."
					value={inputValue}
					onKeyDown={(e) => keyDownEvent(e)}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				{audioLessonEnabled ? (
					<MicrophoneComponent disabled={disabled} setText={setInputValue} onSubmitt={handleSubmit} className={'rounded-lg px-1 h-8 mt-[0.35rem] mr-2  bg-blue-100 text-black'} />
				) : (
					<button disabled={disabled} className={'rounded-lg px-1 h-8 mt-[0.35rem] mr-2 bg-blue-100 text-black'} type="submit" onClick={handleSubmit}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
}
