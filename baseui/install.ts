import Vue, { VueConstructor } from 'vue'

// 导入所有组件
import {
  Button,
  IconButton,
  ToggleButton,
  SegmentedControl,
  DisclosureButton
} from './components/buttons'

import {
  TextField,
  SecureField,
  TextArea,
  SearchField,
  ComboBox,
  Picker
} from './components/forms'

import {
  Text,
  Label,
  Link,
  RichText,
  HTMLView,
  CodeBlock
} from './components/text'

import { Card } from './components/containers'

import {
  Stack,
  HStack,
  VStack,
  Grid,
  GridItem,
  SplitView,
  Pane,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Sidebar,
  Modal,
  Sheet,
  Popover,
  Dialog,
  Window,
  Divider,
  Spacer
} from './components/layout'

import {
  Alert,
  Toast,
  ProgressBar,
  Spinner
} from './components/feedback'

// 组件列表
const components = [
  // 按钮组件
  Button,
  IconButton,
  ToggleButton,
  SegmentedControl,
  DisclosureButton,

  // 文本组件
  Text,
  Label,
  Link,
  RichText,
  HTMLView,
  CodeBlock,

  // 表单组件
  TextField,
  SecureField,
  TextArea,
  SearchField,
  ComboBox,
  Picker,

  // 容器组件
  Card,

  // 布局组件
  Stack,
  HStack,
  VStack,
  Grid,
  GridItem,
  SplitView,
  Pane,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Sidebar,
  Modal,
  Sheet,
  Popover,
  Dialog,
  Window,
  Divider,
  Spacer,

  // 反馈组件
  Alert,
  Toast,
  ProgressBar,
  Spinner
]

// 定义 install 函数
const install = (vue: VueConstructor) => {
  // 注册所有组件
  components.forEach(component => {
    vue.component(component.name || component.options?.name, component)
  })
}

// 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  // 按钮组件
  Button,
  IconButton,
  ToggleButton,
  SegmentedControl,
  DisclosureButton,

  // 文本组件
  Text,
  Label,
  Link,
  RichText,
  HTMLView,
  CodeBlock,

  // 表单组件
  TextField,
  SecureField,
  TextArea,
  SearchField,
  ComboBox,
  Picker,

  // 容器组件
  Card,

  // 布局组件
  Stack,
  HStack,
  VStack,
  Grid,
  GridItem,
  SplitView,
  Pane,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Sidebar,
  Modal,
  Sheet,
  Popover,
  Dialog,
  Window,
  Divider,
  Spacer,

  // 反馈组件
  Alert,
  Toast,
  ProgressBar,
  Spinner
}

export {
  install,
  // 按钮组件
  Button,
  IconButton,
  ToggleButton,
  SegmentedControl,
  DisclosureButton,

  // 文本组件
  Text,
  Label,
  Link,
  RichText,
  HTMLView,
  CodeBlock,

  // 表单组件
  TextField,
  SecureField,
  TextArea,
  SearchField,
  ComboBox,
  Picker,

  // 容器组件
  Card,

  // 布局组件
  Stack,
  HStack,
  VStack,
  Grid,
  GridItem,
  SplitView,
  Pane,
  Tabs,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Sidebar,
  Modal,
  Sheet,
  Popover,
  Divider,
  Spacer
}
