import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";

function SignUp() {
  const [value, setValue] = useState("");

  return (
    <div
      className="bg-[#0F0F0F] w-screen h-screen grid grid-cols-12 overflow-hidden
     ">
      <div className="col-span-8 h-full flex items-center justify-end ">
        <div className="h-[calc(100vh-10px)] flex items-center justify-end p-5 overflow-hidden rounded-2xl">
          <img
            src="/img/login_picture_2.png"
            alt=""
            className="h-full max-h-full w-auto object-cover rounded-4xl"
          />
        </div>
      </div>
      <div className="col-span-4 flex flex-col">
        <div className="p-5 flex flex-col gap-8 h-full items-center justify-center">
          <div className="flex items-center justify-center">
            <img src="/img/libry_icon+typography.svg" alt="" />
          </div>
          <div className="flex flex-col gap-8 w-87.5">
            <div className="font-family-koh font-bold text-5xl text-center text-[#F0F0F0]">
              <h2>
                Create new <br /> account
              </h2>
            </div>
            <div className="  flex flex-col gap-8 items-center justify-center">
              <InputText
                className="w-full border-0 px-5 py-3 rounded-[7px] bg-[#272626] font-light text-[#AEAEAE]"
                variant="filled"
                type="text"
                placeholder="Full name"
              />
              <InputText
                className="w-full border-0 px-5 py-3 rounded-[7px] bg-[#272626] font-light text-[#AEAEAE]"
                variant="filled"
                type="email"
                placeholder="Hello@email.com"
              />

              <Password
                className="w-full password-field"
                inputClassName="w-full px-5 py-3 rounded-[7px] bg-[#272626] font-light text-[#AEAEAE]"
                variant="filled"
                placeholder="Your password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                toggleMask
                feedback={false}
              />
              <button className="bg-[#7B8D3B] px-5 py-3 rounded-full w-full text-[#F0F0F0]  font-bold">
                Sign Up
              </button>
            </div>
          </div>
          <div>
            <a href="/login" className="text-[#F0F0F0] text-sm">
              Already a member?
              <span className="text-[#7B8D3B]">Log in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
