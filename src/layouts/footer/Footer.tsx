import DiscordIcon from "../../assets/discord.svg";
import TwitterIcon from "../../assets/twitter.svg";

const Footer = () => {
  return (
    <footer className="border-t border-[#888] relative z-[10] py-3">
      <div className="ml-5 flex flex-wrap gap-[30%] items-center">
        <div className="flex gap-10">
          <div>
            <a>Whitepaper</a>
          </div>
          <div className="flex flex-col">
            <a className="flex gap-2" href=" https://x.com/TheNFTLauncher" target="_blank">
              <img src={TwitterIcon} width={"20px"} />
              Twitter
            </a>
            <a className="flex gap-2" href="https://discord.gg/e3JEqsPR9r" target="_blank">
              <img src={DiscordIcon} width={"20px"} />
              Discord
            </a>
          </div>
        </div>

        <div>
          <p>© 2024 Launcher Skulls</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
