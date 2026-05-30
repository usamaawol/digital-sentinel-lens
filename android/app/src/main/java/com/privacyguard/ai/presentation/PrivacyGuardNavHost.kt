package com.privacyguard.ai.presentation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.privacyguard.ai.presentation.screen.AppDetailScreen
import com.privacyguard.ai.presentation.screen.AppsScreen
import com.privacyguard.ai.presentation.screen.AssistantScreen
import com.privacyguard.ai.presentation.screen.DashboardScreen
import com.privacyguard.ai.presentation.screen.NotificationsScreen
import com.privacyguard.ai.presentation.screen.PolicyAnalyzerScreen
import com.privacyguard.ai.presentation.screen.SettingsScreen
import com.privacyguard.ai.presentation.screen.auth.LoginScreen
import com.privacyguard.ai.presentation.screen.auth.SignUpScreen

/**
 * Navigation host for the Privacy Guard AI app.
 *
 * Routes mirror the web frontend's route structure:
 * - /login          → LoginScreen
 * - /signup         → SignUpScreen
 * - /dashboard      → DashboardScreen
 * - /apps           → AppsScreen
 * - /apps/{pkg}     → AppDetailScreen
 * - /assistant      → AssistantScreen
 * - /policy-analyzer → PolicyAnalyzerScreen
 * - /notifications  → NotificationsScreen
 * - /settings       → SettingsScreen
 */
@Composable
fun PrivacyGuardNavHost(
    navController: NavHostController = rememberNavController(),
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route,
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToSignUp = {
                    navController.navigate(Screen.SignUp.route)
                },
            )
        }

        composable(Screen.SignUp.route) {
            SignUpScreen(
                onSignUpSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                },
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToApps = { navController.navigate(Screen.Apps.route) },
                onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
            )
        }

        composable(Screen.Apps.route) {
            AppsScreen(
                onAppClick = { packageName ->
                    navController.navigate(Screen.AppDetail.createRoute(packageName))
                },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(
            route = Screen.AppDetail.route,
            arguments = listOf(
                navArgument("packageName") { type = NavType.StringType }
            ),
        ) {
            AppDetailScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Assistant.route) {
            AssistantScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.PolicyAnalyzer.route) {
            PolicyAnalyzerScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Notifications.route) {
            NotificationsScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
                onSignOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object Dashboard : Screen("dashboard")
    object Apps : Screen("apps")
    object AppDetail : Screen("apps/{packageName}") {
        fun createRoute(packageName: String) = "apps/$packageName"
    }
    object Assistant : Screen("assistant")
    object PolicyAnalyzer : Screen("policy-analyzer")
    object Notifications : Screen("notifications")
    object Settings : Screen("settings")
}
