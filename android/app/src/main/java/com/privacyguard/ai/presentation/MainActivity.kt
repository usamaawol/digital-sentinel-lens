package com.privacyguard.ai.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.privacyguard.ai.presentation.theme.PrivacyGuardTheme
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main entry point for the Privacy Guard AI Android application.
 *
 * This activity hosts the Jetpack Compose navigation graph.
 * Authentication is handled by Firebase Auth (same project as the web frontend).
 *
 * The Android app and web dashboard share the same Firebase project:
 * - Firebase Auth: users sign in with the same credentials
 * - Firestore: app scan summaries are synced to the same collections
 *   that the web dashboard reads from
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PrivacyGuardTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    PrivacyGuardNavHost()
                }
            }
        }
    }
}
