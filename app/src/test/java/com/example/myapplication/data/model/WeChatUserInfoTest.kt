package com.example.myapplication.data.model

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 微信用户信息数据模型单元测试
 * TDD模式：测试先行，确保数据模型的完整性和正确性
 */
class WeChatUserInfoTest {

    @Test
    fun `create WeChatUserInfo with all valid parameters should succeed`() {
        // Given
        val openid = "test_openid_12345"
        val nickname = "测试用户"
        val avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        val unionid = "test_unionid_67890"
        val sex = 1
        val province = "广东"
        val city = "深圳"
        val country = "中国"

        // When
        val userInfo = WeChatUserInfo(
            openid = openid,
            nickname = nickname,
            avatarUrl = avatarUrl,
            unionid = unionid,
            sex = sex,
            province = province,
            city = city,
            country = country
        )

        // Then
        assertEquals(openid, userInfo.openid)
        assertEquals(nickname, userInfo.nickname)
        assertEquals(avatarUrl, userInfo.avatarUrl)
        assertEquals(unionid, userInfo.unionid)
        assertEquals(sex, userInfo.sex)
        assertEquals(province, userInfo.province)
        assertEquals(city, userInfo.city)
        assertEquals(country, userInfo.country)
    }

    @Test
    fun `create WeChatUserInfo with minimum required parameters should succeed`() {
        // Given - 只有必需的openid参数
        val openid = "test_openid_12345"

        // When
        val userInfo = WeChatUserInfo(openid = openid)

        // Then
        assertEquals(openid, userInfo.openid)
        assertNull(userInfo.nickname)
        assertNull(userInfo.avatarUrl)
        assertNull(userInfo.unionid)
        assertEquals(0, userInfo.sex)
        assertNull(userInfo.province)
        assertNull(userInfo.city)
        assertNull(userInfo.country)
    }

    @Test
    fun `create WeChatUserInfo with empty openid should throw exception`() {
        // Given
        val emptyOpenid = ""

        // When & Then
        try {
            WeChatUserInfo(openid = emptyOpenid)
            fail("Expected IllegalArgumentException for empty openid")
        } catch (e: IllegalArgumentException) {
            assertEquals("OpenID cannot be null or empty", e.message)
        }
    }

    @Test
    fun `create WeChatUserInfo with null openid should throw exception`() {
        // Given
        val nullOpenid = null

        // When & Then
        try {
            WeChatUserInfo(openid = null!!)
            fail("Expected IllegalArgumentException for null openid")
        } catch (e: IllegalArgumentException) {
            assertEquals("OpenID cannot be null or empty", e.message)
        }
    }

    @Test
    fun `WeChatUserInfo equals should work correctly`() {
        // Given
        val userInfo1 = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val userInfo2 = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val userInfo3 = WeChatUserInfo(
            openid = "test_openid_67890",
            nickname = "测试用户"
        )

        // When & Then
        assertEquals(userInfo1, userInfo2)
        assertNotEquals(userInfo1, userInfo3)
        assertNotEquals(userInfo1, null)
        assertNotEquals(userInfo1, "string")
    }

    @Test
    fun `WeChatUserInfo hashCode should be consistent`() {
        // Given
        val userInfo1 = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val userInfo2 = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )

        // When & Then
        assertEquals(userInfo1.hashCode(), userInfo2.hashCode())
    }

    @Test
    fun `WeChatUserInfo toString should contain relevant information`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )

        // When
        val result = userInfo.toString()

        // Then
        assertTrue("toString should contain openid", result.contains("test_openid_12345"))
        assertTrue("toString should contain nickname", result.contains("测试用户"))
        assertTrue("toString should contain avatarUrl", result.contains("https://wx.qlogo.cn/avatar/test.jpg"))
    }

    @Test
    fun `WeChatUserInfo copy should work correctly`() {
        // Given
        val originalUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )

        // When
        val copiedUserInfo = originalUserInfo.copy(nickname = "新昵称")

        // Then
        assertEquals(originalUserInfo.openid, copiedUserInfo.openid)
        assertEquals(originalUserInfo.avatarUrl, copiedUserInfo.avatarUrl)
        assertEquals("新昵称", copiedUserInfo.nickname)
        assertNotEquals(originalUserInfo.nickname, copiedUserInfo.nickname)
    }

    @Test
    fun `WeChatUserInfo should handle special characters in nickname`() {
        // Given
        val nicknameWithSpecialChars = "用户🎉测试@#$%"

        // When
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = nicknameWithSpecialChars
        )

        // Then
        assertEquals(nicknameWithSpecialChars, userInfo.nickname)
    }

    @Test
    fun `WeChatUserInfo should validate sex parameter bounds`() {
        // Given - 测试性别参数的有效范围
        val validSexValues = listOf(0, 1, 2) // 0=未知, 1=男, 2=女

        // When & Then
        validSexValues.forEach { sex ->
            val userInfo = WeChatUserInfo(
                openid = "test_openid_12345",
                sex = sex
            )
            assertEquals(sex, userInfo.sex)
        }
    }

    @Test
    fun `WeChatUserInfo should handle null location information`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            province = null,
            city = null,
            country = null
        )

        // When & Then
        assertNull(userInfo.province)
        assertNull(userInfo.city)
        assertNull(userInfo.country)
    }
}