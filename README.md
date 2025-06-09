# react-richeditor

基于`quill`的富文本编辑器组件，提供`Editor`和`Render`两个组件。使用方法见`examples`。

## 开发流程

- 在`examples/`中执行`pnpm dev`启动开发服务，此时修改`/project_root/src/`中的组件源码会实时生效；
- 开发完成后，在项目根目录执行`pnpm build`构建即可；
- 其余项目使用`pnpm install --force`强制重新安装依赖，确保最新的代码被安装。