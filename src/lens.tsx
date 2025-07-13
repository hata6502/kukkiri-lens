import {
  CameraIcon,
  DevicePhoneMobileIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import type { ChangeEventHandler, FunctionComponent } from "react";

export const Lens: FunctionComponent = () => {
  const appInstalled = !matchMedia("(display-mode: browser)").matches;

  const [detecting, setDetecting] = useState(false);
  const [tried, setTried] = useState(false);

  const htmlContainerRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCameraButton = () => {
    if (!cameraInputRef.current) {
      throw new Error("Camera input ref is not set");
    }

    cameraInputRef.current.click();
  };

  const handleGalleryButton = () => {
    if (!galleryInputRef.current) {
      throw new Error("Gallery input ref is not set");
    }

    galleryInputRef.current.click();
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

      const image = new Image();
      image.src = URL.createObjectURL(file);
      await image.decode();

      // 解像度やimage orientationを補正する
      const canvas = document.createElement("canvas");
      const zoom = Math.min(
        Math.min(image.naturalWidth, 1920) / image.naturalWidth,
        Math.min(image.naturalHeight, 1920) / image.naturalHeight,
      );
      canvas.width = image.naturalWidth * zoom;
      canvas.height = image.naturalHeight * zoom;
      const canvasContext = canvas.getContext("2d");
      if (!canvasContext) {
        throw new Error("Canvas context is not available");
      }
      canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");
      const href = await new Promise<string>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
            return;
          }

          resolve(URL.createObjectURL(blob));
        }, "image/jpeg");
      });

      const response = await fetch(
        "https://ocr-162013450789.us-central1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            href,
            alt: "",
            image: dataURL.split(",")[1],
            width: canvas.width,
            height: canvas.height,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch OCR result: ${response.status} ${response.statusText}`,
        );
      }
      const { html } = await response.json();

      htmlContainer.innerHTML = html;

      const imageElement = htmlContainer.querySelector("image");
      if (!imageElement) {
        throw new Error("Image element not found in HTML");
      }

      for (const text of htmlContainer.querySelectorAll("text")) {
        text.setAttribute("fill", "#000000");

        const backgroundRect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );

        const horizontal =
          text.getAttribute("writing-mode") === "horizontal-tb";
        const width = Number(text.getAttribute("textLength"));
        const height = Number(
          text.getAttribute("font-size")?.replace("px", ""),
        );

        backgroundRect.setAttribute(
          "x",
          String(
            Number(text.getAttribute("x")) - (horizontal ? 0 : height / 2),
          ),
        );
        backgroundRect.setAttribute(
          "y",
          String(
            Number(text.getAttribute("y")) - (horizontal ? height / 2 : 0),
          ),
        );
        backgroundRect.setAttribute(
          "width",
          String(horizontal ? width : height),
        );
        backgroundRect.setAttribute(
          "height",
          String(horizontal ? height : width),
        );
        backgroundRect.setAttribute("fill", "#cceeff");

        imageElement.after(backgroundRect);
      }

      setTried(true);
    } catch (exception) {
      alert(exception);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-y-4">
        <button
          type="button"
          disabled={detecting}
          onClick={handleCameraButton}
          className="relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CameraIcon className="size-6 shrink-0" aria-hidden="true" />
          {detecting ? "文字認識中…" : "カメラで撮る"}
        </button>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />

        {!detecting && (
          <>
            <div className="flex items-center gap-x-4">
              <div className="h-px w-16 bg-zinc-300"></div>
              <span className="text-sm font-medium text-zinc-500">または</span>
              <div className="h-px w-16 bg-zinc-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGalleryButton}
              className="relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <PhotoIcon className="size-5 shrink-0" aria-hidden="true" />
              写真を選択
            </button>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </>
        )}
      </div>

      <div
        ref={htmlContainerRef}
        className="flex min-h-[200px] items-center justify-center rounded-lg border border-zinc-950/10 bg-zinc-50 p-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      >
        <p className="text-center text-base/6 text-zinc-500 sm:text-sm/6">
          写真を撮影すると、文字認識結果がここに表示されます
        </p>
      </div>

      {tried && !appInstalled && (
        <div className="relative isolate rounded-lg bg-blue-50 p-6 shadow-sm ring-1 ring-blue-200/50">
          <div className="flex items-start gap-x-4">
            <DevicePhoneMobileIcon
              data-slot="icon"
              className="size-6 shrink-0 text-blue-600"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base/7 font-semibold text-blue-950 sm:text-sm/6">
                アプリとしてインストール
              </h3>

              <p className="mt-1 text-base/6 text-zinc-500 sm:text-sm/6">
                ホーム画面に追加すると、より快適にご利用いただけます。
                <br />
                ブラウザのメニューから「ホーム画面に追加」を選択してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
