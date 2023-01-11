import { path } from "webnative"

const PERMISSIONS = {
    app: {
        name: "hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [path.directory('Apps', 'snail-situation', 'hermes')],
        private: [path.directory('Apps', 'snail-situation', 'hermes')]
    }
}

export default PERMISSIONS
