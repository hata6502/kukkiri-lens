import { DocumentTextIcon } from "@heroicons/react/24/outline";
import type { FunctionComponent } from "react";

import { Lens } from "./lens";

const faqs = [
  {
    title: "写真地図",
    url: "https://almap.hata6502.com/",
  },
  {
    title: "Searchable SVG Generator",
    url: "https://scrapbox.io/hata6502/Searchable_SVG_Generator",
  },
  {
    title: "手書きに合わせた自動スクロール",
    url: "https://scrapbox.io/hata6502/%E6%89%8B%E6%9B%B8%E3%81%8D%E3%81%AB%E5%90%88%E3%82%8F%E3%81%9B%E3%81%9F%E8%87%AA%E5%8B%95%E3%82%B9%E3%82%AF%E3%83%AD%E3%83%BC%E3%83%AB",
  },
];

export const App: FunctionComponent = () => {
  return (
    <div className="mx-auto mb-16 max-w-4xl bg-white px-8">
      <div className="mt-16">
        <h1 className="flex flex-col-reverse items-center justify-center gap-4 text-center text-4xl/8 font-semibold break-words break-keep text-zinc-950 md:flex-row md:text-5xl/[1.1]">
          くっきり
          <wbr />
          レンズ
          <img src="favicon.png" className="inline w-20" />
        </h1>

        <p className="mt-6 text-center text-lg/7 text-zinc-500 sm:text-base/6">
          スマホのカメラでくっきりと文字を読めるようになります
          <br />
          かすれた黒板や手書きのメモにも対応
        </p>
      </div>

      <div className="mt-16">
        <Lens />
      </div>

      <div className="mt-16">
        <div className="divide-y divide-zinc-950/5">
          {faqs.map(({ title, url }) => (
            <a
              key={title}
              href={url}
              target="_blank"
              className="group flex items-center gap-x-4 py-6 text-zinc-950 no-underline data-[hover]:bg-zinc-950/[2.5%]"
            >
              <DocumentTextIcon
                data-slot="icon"
                className="size-6 shrink-0 text-zinc-500 group-hover:text-zinc-700"
                aria-hidden="true"
              />
              <span className="text-lg/7 font-semibold text-zinc-950 sm:text-base/6">
                {title}
              </span>
            </a>
          ))}
        </div>
      </div>

      <footer className="mt-16">
        <p className="text-xs leading-5 text-gray-500">
          {new Date().getFullYear()}
          &nbsp;
          <a
            href="https://twitter.com/hata6502"
            target="_blank"
            className="hover:text-gray-600"
          >
            ムギュウ
          </a>
          &emsp;
          <a
            href="https://scrapbox.io/hata6502/%E3%81%8F%E3%81%A3%E3%81%8D%E3%82%8A%E3%83%AC%E3%83%B3%E3%82%BA%E5%85%8D%E8%B2%AC%E4%BA%8B%E9%A0%85"
            target="_blank"
            className="hover:text-gray-600"
          >
            免責事項
          </a>
        </p>
      </footer>
    </div>
  );
};
