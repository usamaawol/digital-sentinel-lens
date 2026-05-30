package com.privacyguard.ai.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.ChatMessage
import com.privacyguard.ai.domain.repository.ChatRole
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for the AI Privacy Assistant screen.
 *
 * Feature 9: AI Privacy Assistant
 *
 * Manages the conversation state and delegates AI calls to [AiRepository].
 * Uses [MockAiRepository] until the OpenRouter API key is configured.
 */
@HiltViewModel
class AssistantViewModel @Inject constructor(
    private val aiRepository: AiRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AssistantUiState())
    val uiState: StateFlow<AssistantUiState> = _uiState.asStateFlow()

    init {
        // Add the initial greeting message
        _uiState.update {
            it.copy(
                messages = listOf(
                    UiChatMessage(
                        role = ChatRole.ASSISTANT,
                        content = "Hi! I'm your Privacy Guard assistant. Ask me about an app, " +
                            "a permission, or paste a privacy policy snippet — I'll explain it in plain English.",
                    )
                )
            )
        }
    }

    /**
     * Sends a user message and gets an AI response.
     */
    fun sendMessage(content: String) {
        if (content.isBlank()) return

        val userMessage = UiChatMessage(role = ChatRole.USER, content = content)
        val updatedMessages = _uiState.value.messages + userMessage

        _uiState.update {
            it.copy(
                messages = updatedMessages,
                isTyping = true,
                error = null,
            )
        }

        viewModelScope.launch {
            try {
                // Convert UI messages to domain messages (exclude system messages)
                val domainMessages = updatedMessages
                    .filter { it.role != ChatRole.SYSTEM }
                    .map { ChatMessage(role = it.role, content = it.content) }

                val response = aiRepository.chat(domainMessages)

                val assistantMessage = UiChatMessage(
                    role = ChatRole.ASSISTANT,
                    content = response,
                )

                _uiState.update {
                    it.copy(
                        messages = it.messages + assistantMessage,
                        isTyping = false,
                    )
                }
            } catch (e: Exception) {
                Timber.e(e, "AI chat failed")
                val errorMessage = UiChatMessage(
                    role = ChatRole.ASSISTANT,
                    content = "⚠️ ${e.message ?: "Something went wrong. Please try again."}",
                )
                _uiState.update {
                    it.copy(
                        messages = it.messages + errorMessage,
                        isTyping = false,
                        error = e.message,
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class AssistantUiState(
    val messages: List<UiChatMessage> = emptyList(),
    val isTyping: Boolean = false,
    val error: String? = null,
)

data class UiChatMessage(
    val role: ChatRole,
    val content: String,
)
