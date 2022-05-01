import React, {
    PropsWithChildren,
    ReactElement,
    ReactNode,
    useMemo,
    useState,
} from "react";
import { browser, Tabs } from "webextension-polyfill-ts";
import css from "./styles.module.css";
import Tab = Tabs.Tab;
import CBNFTLogo from "@src/popup/CBNFTLogo";

export function Popup(): ReactElement {
    const [currTab, setCurrTab] = useState<Tab>();

    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true }).catch(() => null);

        browser.tabs
            .query({ active: true, lastFocusedWindow: true })
            .then((tabs) => setCurrTab(tabs[0]))
            .catch(() => null);
    }, []);

    const isCBNFT = currTab?.url?.includes("nft.coinbase.com");
    const isNFTinCBNFT = isCBNFT && currTab?.url?.includes("/nft/");

    const isOS = currTab?.url?.includes("opensea.io");
    const isNFTinOS = isOS && currTab?.url?.includes("/assets/");

    const nftParts = useMemo(() => {
        if (!currTab) return undefined;

        const urlParts = currTab.url?.split("/") || [];
        const lastIndex = urlParts.length - 1;

        console.log(urlParts);

        if (isNFTinCBNFT) {
            return {
                network: urlParts[lastIndex - 2],
                collection: urlParts[lastIndex - 1],
                id: urlParts[lastIndex],
            };
        }
        if (isNFTinOS) {
            return {
                network: "ethereum",
                collection: urlParts[lastIndex - 1],
                id: urlParts[lastIndex],
            };
        }
    }, [currTab]);

    return (
        <div className={css.popupContainer}>
            <div
                className={
                    "bg-white shadow-xl py-2 flex justify-center text-lg font-medium tracking-wide items-center gap-1"
                }
            >
                <div>
                    <img
                        src={"/degenav_16.png"}
                        alt={""}
                        className={"h-5 aspect-square"}
                    />
                </div>
                DegeNav
            </div>
            <div
                className={`p-4 overflow-visible flex flex-col gap-4 w-full h-full ${
                    isNFTinOS ? "flex-col-reverse" : ""
                }`}
            >
                {isNFTinCBNFT || isNFTinOS ? (
                    <>
                        <OpenCard
                            isOpen={isNFTinOS}
                            img={
                                "https://storage.googleapis.com/opensea-static/Logomark/OpenSea-Full-Logo%20(dark).png"
                            }
                            name="OpenSea"
                            url={`https://opensea.io/assets/${nftParts?.collection}/${nftParts?.id}`}
                        />
                        <OpenCard
                            isOpen={isNFTinCBNFT}
                            img={
                                <div className="mb-3">
                                    <CBNFTLogo />
                                </div>
                            }
                            name="Coinbase NFT"
                            url={`https://nft.coinbase.com/nft/${nftParts?.network}/${nftParts?.collection}/${nftParts?.id}`}
                        />
                    </>
                ) : (
                    <>
                        <div className={"rotate-90 text-4xl text-center"}>
                            :(
                        </div>
                        <h1 className={"text-lg text-center"}>
                            Does not look like an NFT
                        </h1>
                        <div className={"flex flex-col gap-4"}>
                            <ButtonLink
                                label={"Open Coinbase NFT"}
                                href={"https://nft.coinbase.com"}
                            />
                            <ButtonLink
                                label={"Open OpenSea"}
                                href={"https://opensea.io"}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const CardShell = (props: PropsWithChildren<any>) => {
    return (
        <div
            className={
                "bg-white rounded-xl flex flex-col items-center justify-center gap-2 p-4 shadow-2xl"
            }
        >
            {props.children}
        </div>
    );
};

const OpenCard = ({
    img,
    name,
    url,
    isOpen,
}: {
    img: string | ReactNode;
    name: string;
    url: string;
    isOpen?: boolean;
}) => {
    return (
        <CardShell>
            {typeof img === "string" ? (
                <img src={img} alt={""} className={"h-auto w-6/12 mb-2"} />
            ) : (
                img
            )}
            {isOpen ? (
                <div
                    className={
                        "text-[14px] text-center p-3 font-bold rounded-pill bg-gray-300 text-gray-600 w-full "
                    }
                >
                    You are here
                </div>
            ) : (
                <ButtonLink label={`Open in ${name}`} href={url} />
            )}
        </CardShell>
    );
};

const ButtonLink = ({ label, href }: { label: string; href: string }) => {
    return (
        <a
            role={"button"}
            href={href}
            target={"_blank"}
            className={
                "block bg-blue-600 rounded-pill p-3 hover:bg-blue-800 text-white text-[14px] font-bold w-full text-center cursor-pointer"
            }
            rel="noreferrer"
        >
            {label}
        </a>
    );
};
