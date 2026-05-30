package com.privacyguard.ai.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.usecase.GetAppsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import javax.inject.Inject

/**
 * ViewModel for the Apps list screen.
 *
 * Supports:
 * - Observing all scanned apps
 * - Filtering by risk level
 * - Searching by app name
 */
@HiltViewModel
class AppsViewModel @Inject constructor(
    private val getAppsUseCase: GetAppsUseCase,
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow(AppFilter.ALL)
    val selectedFilter: StateFlow<AppFilter> = _selectedFilter.asStateFlow()

    private val allApps = getAppsUseCase.observeAll()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    /**
     * Filtered and searched apps list.
     * Combines the raw app list with the current search query and filter.
     */
    val filteredApps: StateFlow<List<AppInfo>> = combine(
        allApps,
        _searchQuery,
        _selectedFilter,
    ) { apps, query, filter ->
        apps
            .filter { app ->
                when (filter) {
                    AppFilter.ALL -> true
                    AppFilter.SAFE -> app.riskLevel == RiskLevel.SAFE || app.riskLevel == RiskLevel.LOW
                    AppFilter.MEDIUM -> app.riskLevel == RiskLevel.MEDIUM
                    AppFilter.HIGH -> app.riskLevel == RiskLevel.HIGH
                }
            }
            .filter { app ->
                query.isBlank() || app.appName.contains(query, ignoreCase = true) ||
                    app.packageName.contains(query, ignoreCase = true)
            }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList(),
    )

    fun setSearchQuery(query: String) {
        _searchQuery.update { query }
    }

    fun setFilter(filter: AppFilter) {
        _selectedFilter.update { filter }
    }
}

enum class AppFilter(val displayName: String) {
    ALL("All"),
    SAFE("Safe"),
    MEDIUM("Medium"),
    HIGH("High"),
}
