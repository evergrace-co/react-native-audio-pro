package dev.rnap.reactnativeaudiopro

import android.os.Bundle
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.CommandButton
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaLibraryService.LibraryParams
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionError
import androidx.media3.session.SessionResult
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

/** A [MediaLibraryService.MediaLibrarySession.Callback] implementation. */
@UnstableApi
open class AudioProMediaLibrarySessionCallback : MediaLibraryService.MediaLibrarySession.Callback {

	private val nextButton = CommandButton.Builder(CommandButton.ICON_NEXT)
		.setDisplayName("Next")
		.setSessionCommand(
			SessionCommand(
				CUSTOM_COMMAND_NEXT,
				Bundle.EMPTY
			)
		)
		.build()

	private val prevButton = CommandButton.Builder(CommandButton.ICON_PREVIOUS)
		.setDisplayName("Previous")
		.setSessionCommand(
			SessionCommand(
				CUSTOM_COMMAND_PREV,
				Bundle.EMPTY
			)
		)
		.build()

	private val skipForwardButton = CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD)
		.setDisplayName("Skip Forward")
		.setSessionCommand(
			SessionCommand(
				CUSTOM_COMMAND_SKIP_FORWARD,
				Bundle.EMPTY
			)
		)
		.build()

	private val skipBackwardButton = CommandButton.Builder(CommandButton.ICON_SKIP_BACK)
		.setDisplayName("Skip Backward")
		.setSessionCommand(
			SessionCommand(
				CUSTOM_COMMAND_SKIP_BACKWARD,
				Bundle.EMPTY
			)
		)
		.build()

	private fun getCommandButtons(): List<CommandButton> {
		val buttons = mutableListOf<CommandButton>()

		// Always provide 15-/30-second skip controls
		buttons.add(skipBackwardButton)
		buttons.add(skipForwardButton)

		if (AudioProController.settingShowNextPrevControls) {
			AudioProController.log("Next/Prev controls are enabled")
			buttons.add(nextButton)
			buttons.add(prevButton)
		} else {
			AudioProController.log("Next/Prev controls are disabled")
		}

		return buttons
	}

	companion object {
		private const val CUSTOM_COMMAND_NEXT =
			"dev.rnap.reactnativeaudiopro.NEXT"
		private const val CUSTOM_COMMAND_PREV =
			"dev.rnap.reactnativeaudiopro.PREV"
		private const val CUSTOM_COMMAND_SKIP_FORWARD =
			"dev.rnap.reactnativeaudiopro.SKIP_FORWARD"
		private const val CUSTOM_COMMAND_SKIP_BACKWARD =
			"dev.rnap.reactnativeaudiopro.SKIP_BACKWARD"
	}

	@OptIn(UnstableApi::class) // MediaSession.ConnectionResult.DEFAULT_SESSION_AND_LIBRARY_COMMANDS
	val mediaNotificationSessionCommands
		get() = MediaSession.ConnectionResult.DEFAULT_SESSION_AND_LIBRARY_COMMANDS.buildUpon()
			.also { builder ->
				// Add custom commands based on settings
				if (AudioProController.settingShowNextPrevControls) {
					// Add next and previous commands
					builder.add(SessionCommand(CUSTOM_COMMAND_NEXT, Bundle.EMPTY))
					builder.add(SessionCommand(CUSTOM_COMMAND_PREV, Bundle.EMPTY))
				} else if (AudioProController.settingShowSkipControls) {
					// Add skip forward and skip backward commands
					builder.add(SessionCommand(CUSTOM_COMMAND_SKIP_FORWARD, Bundle.EMPTY))
					builder.add(SessionCommand(CUSTOM_COMMAND_SKIP_BACKWARD, Bundle.EMPTY))
				}
				// If both settings are false, no custom commands are added, only default commands
			}
			.build()

	@OptIn(UnstableApi::class)
	override fun onConnect(
		session: MediaSession,
		controller: MediaSession.ControllerInfo,
	): MediaSession.ConnectionResult {
		return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
			.setAvailableSessionCommands(mediaNotificationSessionCommands)
			.setMediaButtonPreferences(getCommandButtons())
			.build()
	}

	@OptIn(UnstableApi::class) // MediaSession.isMediaNotificationController
	override fun onCustomCommand(
		session: MediaSession,
		controller: MediaSession.ControllerInfo,
		customCommand: SessionCommand,
		args: Bundle,
	): ListenableFuture<SessionResult> {
		when (customCommand.customAction) {
			CUSTOM_COMMAND_NEXT -> {
				AudioProController.emitNext()
				return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
			}

			CUSTOM_COMMAND_PREV -> {
				AudioProController.emitPrev()
				return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
			}

			CUSTOM_COMMAND_SKIP_FORWARD -> {
				AudioProController.seekForward(AudioProController.settingSkipIntervalMs)
				return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
			}

			CUSTOM_COMMAND_SKIP_BACKWARD -> {
				AudioProController.seekBack(AudioProController.settingSkipIntervalMs)
				return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
			}
		}

		return Futures.immediateFuture(SessionResult(SessionError.ERROR_NOT_SUPPORTED))
	}

	override fun onAddMediaItems(
		mediaSession: MediaSession,
		controller: MediaSession.ControllerInfo,
		mediaItems: List<MediaItem>,
	): ListenableFuture<List<MediaItem>> {
		return Futures.immediateFuture(mediaItems)
	}

	override fun onGetLibraryRoot(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            params: MediaLibraryService.LibraryParams?
    ): ListenableFuture<LibraryResult<MediaItem>> {
        Log.i("AudioProMediaLibrary", "onGetLibraryRoot: params=$params")
        val root =
                MediaItem.Builder()
                        .setMediaId("root")
                        .setMediaMetadata(
                                MediaMetadata.Builder()
                                        .setTitle("Browse Library")
                                        .setIsBrowsable(true)
                                        .setIsPlayable(false)
                                        .build()
                        )
                        .build()
        return Futures.immediateFuture(LibraryResult.ofItem(root, params))
    }

    override fun onGetChildren(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
    ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
        return Futures.immediateFuture(LibraryResult.ofItemList(ImmutableList.of(), params))
    }

    override fun onGetItem(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            mediaId: String
    ): ListenableFuture<LibraryResult<MediaItem>> {
        return Futures.immediateFuture(null)
    }
}
