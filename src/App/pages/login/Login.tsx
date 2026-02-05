import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";
import { useRef, useState } from "react";
import "./login.css";
import { useNavigate } from "react-router";
import { authService } from "../../shared/services/auth.service";
import { useInject } from "../../shared/modules/di";
import { LoginDtoModelLike } from "../../shared/models/dto/users.model";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const toast = useRef(null);

  const LoginService = useInject(authService);

  const model: LoginDtoModelLike = {
    email: email ?? null,
    password: password ?? null,
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    LoginService.login(model).subscribe({
      next: (token) => {
        console.log("Token received:", token);
        localStorage.setItem("authToken", token);
        console.log(
          "Token stored in localStorage:",
          localStorage.getItem("authToken"),
        );
        navigate("/", { replace: true });
        console.log("Login realizado com sucesso");
      },
      error: (err) => {
        console.error("Login error:", err);
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: `Não foi possível realizar o login: ${err.message}`,
          life: 3000,
        });
      },
    });
  };

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
                Login to your <br /> account
              </h2>
            </div>
            <div className="  flex flex-col gap-8 items-center justify-center">
              <InputText
                className="w-full border-0 px-5 py-3 rounded-[7px] bg-[#272626] font-light text-[#AEAEAE]"
                variant="filled"
                type="email"
                placeholder="Hello@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Password
                className="w-full password-field"
                inputClassName="w-full px-5 py-3 rounded-[7px] bg-[#272626] font-light text-[#AEAEAE]"
                variant="filled"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false}
              />
              <button
                onClick={handleLogin}
                className="bg-[#7B8D3B] px-5 py-3 rounded-full w-full text-[#F0F0F0]  font-bold">
                Login
              </button>
            </div>
          </div>
          <div>
            <a href="/signup" className="text-[#F0F0F0] text-sm">
              Don’t have an account?{" "}
              <span className="text-[#7B8D3B]">Sign up</span>
            </a>
          </div>
        </div>
      </div>
      <Toast ref={toast} position="bottom-right" />
    </div>
  );
};
