package com.example.myapplication.data.model

/**
 * 微信用户信息数据模型
 * 封装从微信获取的用户基本信息
 */
data class WeChatUserInfo(
    val openid: String,
    val nickname: String? = null,
    val avatarUrl: String? = null,
    val unionid: String? = null,
    val sex: Int = 0, // 0=未知, 1=男, 2=女
    val province: String? = null,
    val city: String? = null,
    val country: String? = null
) {
    init {
        // 验证必需的openid参数
        if (openid.isBlank()) {
            throw IllegalArgumentException("OpenID cannot be null or empty")
        }
    }

    /**
     * 获取用户显示名称
     * 如果昵称为空，则返回默认名称
     */
    fun getDisplayName(): String {
        return if (!nickname.isNullOrBlank()) {
            nickname
        } else {
            "微信用户"
        }
    }

    /**
     * 获取用户头像URL
     * 如果头像为空，则返回默认头像
     */
    fun getAvatarUrlSafe(): String {
        return avatarUrl ?: ""
    }

    /**
     * 获取性别描述
     */
    fun getSexDescription(): String {
        return when (sex) {
            1 -> "男"
            2 -> "女"
            else -> "未知"
        }
    }

    /**
     * 获取完整位置信息
     */
    fun getFullLocation(): String {
        val locations = mutableListOf<String>()
        country?.let { locations.add(it) }
        province?.let { locations.add(it) }
        city?.let { locations.add(it) }
        return locations.joinToString(" ")
    }

    /**
     * 检查是否有完整的位置信息
     */
    fun hasLocationInfo(): Boolean {
        return !province.isNullOrBlank() || !city.isNullOrBlank() || !country.isNullOrBlank()
    }

    /**
     * 检查是否有UnionID（开放平台唯一标识）
     */
    fun hasUnionId(): Boolean {
        return !unionid.isNullOrBlank()
    }

    /**
     * 创建用户的简短描述
     */
    fun getShortDescription(): String {
        val name = getDisplayName()
        val location = if (hasLocationInfo()) {
            val loc = getFullLocation()
            " · $loc"
        } else {
            ""
        }
        return "$name$location"
    }
}