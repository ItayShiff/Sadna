import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BsFillPersonFill, BsFillHouseFill } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { AiOutlineSave } from "react-icons/ai";
import styles from "../styles/header.module.css";

const Header = () => {
  const input = useRef();
  const [nickname, setNickname] = useState(null);
  const router = useRouter();
  const isHomepageNow = router.pathname === "/";

  useEffect(() => {
    const nicknameLocalStorage = localStorage.getItem("nickname");
    if (nicknameLocalStorage) setNickname(nicknameLocalStorage);
  }, []);

  const [showModalForChoosingNickname, setShowModalForChoosingNickname] = useState(false);
  const changeNickname = () => {
    setShowModalForChoosingNickname(true);
  };

  const closeModalNicknameChoosing = () => {
    setShowModalForChoosingNickname(false);
  };

  const saveNewNickname = () => {
    if (input.current.value && input.current.value !== "") {
      localStorage.setItem("nickname", input.current.value);
      setNickname(input.current.value);
      closeModalNicknameChoosing();
    } else {
      alert("Invalid nickname");
    }
  };

  return (
    <React.Fragment>
      <header>
        <div>
          {isHomepageNow === false ? (
            <Link href="/" className={styles.customLink}>
              <BsFillHouseFill size="20px" />
              {/* <Image src="/homepage.png" alt="homepage" width={18} height={18} style={{ paddingRight: "7px" }} /> */}
              <div>Homepage</div>
            </Link>
          ) : (
            <Link href="/about" className={styles.customLink}>
              <BsFillPersonFill size="20px" />
              <div>About</div>
            </Link>
          )}
        </div>
        <div onClick={changeNickname} className={styles.nicknameButton}>
          <div>{nickname ?? "Guest"}</div>
          <MdEdit size="20px" />
        </div>
      </header>

      {showModalForChoosingNickname === true && (
        <div id="modalForChoosingModelWholeContainer">
          <div id="modalForChoosingModelBodyContainer">
            <div>Choose your nickname</div>
            <input ref={input} defaultValue={nickname} placeholder="Nickname" />
            <div id="buttonsNicknameWrapper">
              <button onClick={closeModalNicknameChoosing}>
                <ImCancelCircle size="20px" color="#f35c5c" />

                <div>Cancel</div>
              </button>
              <button onClick={saveNewNickname}>
                <AiOutlineSave size="20px" color="#99ff8c" />

                <div>Save</div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        header {
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 45px;
          background: linear-gradient(180deg, rgba(30, 30, 30, 1) 20%, rgba(48, 48, 48, 1) 100%);
          color: #dedede;
        }

        header > div {
          padding: 0px 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        #modalForChoosingModelWholeContainer {
          animation-name: fadeIn;
          animation-duration: 500ms;
          background: #171717bd;
          position: fixed;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          z-index: 2;
          color: #ffdf9b;
        }
        #modalForChoosingModelBodyContainer {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #2d2d2d;
          text-align: center;
          padding-top: 10px;
          border-radius: 10px;
          box-shadow: 0px 0px 7px #eece86;
        }

        #modalForChoosingModelBodyContainer div:first-child {
          font-size: 20px;
          padding: 0px 15px;
        }
        #modalForChoosingModelBodyContainer input {
          margin: 7px 10px;
          margin-top: 20px;
          border: 0;
          border-bottom: 1px;
          border-color: #a6a6a6;
          border-style: solid;
          background: unset;
          color: white;
          font-size: 18px;
        }
        #modalForChoosingModelBodyContainer input:focus-visible {
          outline: unset;
        }
        #buttonsNicknameWrapper {
          display: flex;
          padding-top: 5px;
        }
        #buttonsNicknameWrapper button {
          width: 100%;
          border: 0;
          background: unset;
          color: #ffdf9b;
          cursor: pointer;
          transition: color 300ms;

          padding: 13px 0px;
        }
        #buttonsNicknameWrapper button div {
          margin-top: 1px;
        }
        #buttonsNicknameWrapper button:hover {
          color: #f9bf41;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Header;
