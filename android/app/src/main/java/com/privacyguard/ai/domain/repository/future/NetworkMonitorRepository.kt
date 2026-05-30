package com.privacyguard.ai.domain.repository.future

import kotlinx.coroutines.flow.Flow

/**
 * Future Feature: Network Traffic Analysis
 *
 * Architecture stub — NOT yet implemented.
 *
 * This interface defines the contract for future network monitoring capabilities.
 * Implementation will require:
 * - VpnService (android.permission.BIND_VPN_SERVICE)
 * - Local VPN to intercept and analyze traffic
 * - DNS query analysis for tracker detection
 *
 * ⚠️  This is a STUB. Do not implement until the VPN feature is scoped.
 */
interface NetworkMonitorRepository {

    /**
     * Observes network connections made by installed apps.
     * Requires VpnService to be active.
     */
    fun observeNetworkConnections(): Flow<List<NetworkConnection>>

    /**
     * Returns a list of known tracker domains detected in network traffic.
     */
    suspend fun getDetectedTrackers(): List<TrackerInfo>

    /**
     * Starts the local VPN service for traffic analysis.
     */
    suspend fun startMonitoring()

    /**
     * Stops the local VPN service.
     */
    suspend fun stopMonitoring()
}

/** Stub model for a network connection event */
data class NetworkConnection(
    val packageName: String,
    val destinationHost: String,
    val destinationIp: String,
    val port: Int,
    val timestamp: Long,
    val isTracker: Boolean,
)

/** Stub model for a detected tracker */
data class TrackerInfo(
    val domain: String,
    val trackerName: String,
    val category: TrackerCategory,
    val detectedAt: Long,
)

enum class TrackerCategory {
    ADVERTISING,
    ANALYTICS,
    SOCIAL,
    FINGERPRINTING,
    CRYPTOMINING,
    UNKNOWN,
}
