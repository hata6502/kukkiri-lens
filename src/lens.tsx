import { CameraIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import type { ChangeEventHandler, FunctionComponent } from "react";

export const Lens: FunctionComponent = () => {
  const [detecting, setDetecting] = useState(false);

  const htmlContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCameraButton = () => {
    if (!inputRef.current) {
      throw new Error("Input ref is not set");
    }

    inputRef.current.click();
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const selection = window.getSelection();
    if (!selection) {
      throw new Error("Selection is not available");
    }

    if (!htmlContainerRef.current) {
      throw new Error("HTML ref is not set");
    }
    const htmlContainer = htmlContainerRef.current;

    setDetecting(true);
    try {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataURL = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (typeof fileReader.result !== "string") {
            reject(new Error("FileReader result is not a string"));
            return;
          }

          resolve(fileReader.result);
        };
        fileReader.onerror = (error) => {
          reject(error);
        };

        fileReader.readAsDataURL(file);
      });

      const href = URL.createObjectURL(file);

      const image = new Image();
      image.src = href;
      await image.decode();

      const response = await fetch(
        "https://ocr-162013450789.us-central1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            href,
            image: dataURL.split(",")[1],
            width: image.naturalWidth,
            height: image.naturalHeight,
          }),
        },
      );
      if (!response.ok) {
        alert("文字認識に失敗しました。");
        return;
      }
      const { html } = await response.json();

      htmlContainer.innerHTML = html;

      selection.removeAllRanges();
      const range = new Range();
      range.selectNodeContents(htmlContainer);
      selection.addRange(range);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          type="button"
          disabled={detecting}
          onClick={handleCameraButton}
          className="flex items-center gap-x-3 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <CameraIcon className="h-5 w-5" aria-hidden="true" />
          {detecting ? "文字認識中…" : "カメラで撮る"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        ref={htmlContainerRef}
        className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-300 bg-gray-50 p-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
      >
        <p className="text-center text-gray-500">
          写真を撮影すると、文字認識結果がここに表示されます
        </p>
      </div>
    </div>
  );
};
