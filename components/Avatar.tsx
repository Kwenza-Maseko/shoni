import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";

const Avatar = async () => {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <div className="relative w-full">
             <Navbar
                name={session.user.name || "U"}
                email={session.user.email || ""}
                role={session.user.role || "user"}
            />
        </div>
    );
};

export default Avatar;