# ## 可用于数据库去重和对比的唯一元素
### 1. 🔑 商品ID（最推荐，唯一标识）
HTML 中有 4 处 使用了同一个商品ID，格式为纯数字（如 605721986980608 ）：

|属性位置 示例|示例|
|--|--|
|data-tooltip="goodContainer-{id}" |goodContainer-605721986980608 |
|data-tooltip="goodsImage-{id}" |goodsImage-605721986980608 |
|data-tooltip="goodName-{id}" |goodName-605721986980608 |
|data-tooltip="QuickLook-{id}" |QuickLook-605721986980608|
