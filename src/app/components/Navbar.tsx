export default function Navbar(){
    return (
        <div className="flex items-center justify-between px-10 py-6 shadow-xl z-10">
            <div className="flex items-center gap-16">
                <p className="text-5xl font-bold">TalkSphere</p>
                <p className="text-xl font-semibold">Talk to Strangers!</p>
            </div>
            <p className="text-2xl">Online Now</p>
        </div>
    )
}