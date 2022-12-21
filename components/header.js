import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const Header = () => {
  const input = useRef();
  const [nickname, setNickname] = useState(null);

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
          <Image src="/homepage.png" alt="homepage" width={18} height={18} style={{ margin: "10px" }} />
          <Link href="/">Homepage</Link>
        </div>
        <div>
          {nickname ?? "Guest"}
          <Image
            src="/edit.png"
            alt="edit nickname"
            width={18}
            height={18}
            style={{ margin: "10px", cursor: "pointer" }}
            onClick={changeNickname}
          />
        </div>
      </header>

      {showModalForChoosingNickname === true && (
        <div id="modalForChoosingModelWholeContainer">
          <div id="modalForChoosingModelBodyContainer">
            <div>Choose your nickname</div>
            <input ref={input} defaultValue={nickname} />
            <div id="buttonsNicknameWrapper">
              <button onClick={closeModalNicknameChoosing}>Cancel</button>
              <button onClick={saveNewNickname}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #d6ff9e;
          height: 45px;
        }

        header > div {
          padding: 0px 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #modalForChoosingModelWholeContainer {
          background: #3f3f3fcf;
          position: fixed;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }
        #modalForChoosingModelBodyContainer {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #ecffe5;
          text-align: center;
          padding-top: 10px;
          border-radius: 10px;
        }
        #modalForChoosingModelBodyContainer input {
          margin: 0px 10px;
        }
        #buttonsNicknameWrapper {
          display: flex;
          padding-top: 10px;
        }
        #buttonsNicknameWrapper button {
          width: 100%;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Header;
