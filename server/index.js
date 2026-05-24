import http from "http";
import dotenv from "dotenv";
import application from "./src/configs/expressConfig.js";

dotenv.config({ quiet: true });

const app = http.createServer(application);

app.listen(process.env.PORT || 5000, process.env.SERVER || "localhost", (error) => {
	if (!error) {
		console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
	} else {
		console.log(`❌ Error starting server: ${error}`);
	}
});
