enum Alert {
	Aotd = 1 << 0,
	Reply = 1 << 1,
	Loopback = 1 << 2,
	Post = 1 << 3,
	Follower = 1 << 4
}
export default Alert;