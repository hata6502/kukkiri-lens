import { CameraIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import type { ChangeEventHandler, FunctionComponent } from "react";

export const Lens: FunctionComponent = () => {
  const appInstalled = !matchMedia("(display-mode: browser)").matches;

  const [detecting, setDetecting] = useState(false);
  const [tried, setTried] = useState(false);

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
      const title = htmlContainer.querySelector("title");
      if (!title) {
        throw new Error("Title element not found in HTML");
      }
      title.textContent = "";

      selection.removeAllRanges();
      const range = new Range();
      range.selectNodeContents(htmlContainer);
      selection.addRange(range);

      setTried(true);
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
          className="relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-5 py-3 text-base/6 font-semibold text-white before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-blue-600 before:shadow-sm after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)] after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)] focus:outline-hidden data-[active]:after:bg-white/10 data-[disabled]:opacity-50 data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 data-[hover]:after:bg-white/10 sm:px-6 sm:py-3.5 sm:text-lg dark:border-white/5 dark:before:hidden dark:after:-inset-px dark:after:rounded-lg"
        >
          <CameraIcon
            data-slot="icon"
            className="-mx-0.5 my-0.5 size-5 shrink-0 self-center text-blue-200 sm:my-1 sm:size-6"
            aria-hidden="true"
          />
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
        className="flex min-h-[200px] items-center justify-center rounded-lg border border-zinc-950/10 bg-zinc-50 p-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-white/10 dark:bg-zinc-900"
      >
        <p className="text-center text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
          写真を撮影すると、文字認識結果がここに表示されます
        </p>
      </div>

      {tried && !appInstalled && (
        <div className="relative isolate rounded-lg bg-blue-50 p-6 shadow-sm ring-1 ring-blue-200/50 dark:bg-blue-950/50 dark:ring-blue-800/50">
          <div className="flex items-start gap-x-4">
            <DevicePhoneMobileIcon
              data-slot="icon"
              className="size-6 shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base/7 font-semibold text-blue-950 sm:text-sm/6 dark:text-blue-100">
                アプリとしてインストール
              </h3>

              <p className="mt-1 text-base/6 text-blue-700 sm:text-sm/6 dark:text-blue-300">
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
