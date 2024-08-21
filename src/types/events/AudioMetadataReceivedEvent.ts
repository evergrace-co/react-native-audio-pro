export type AudioMetadataReceivedEvent = {
	metadata: AudioMetadata[];
};

export type AudioCommonMetadataReceivedEvent = {
	metadata: AudioCommonMetadata;
};

export type AudioCommonMetadata = {
	title: string | undefined;
	artist: string | undefined;
	albumTitle: string | undefined;
	subtitle: string | undefined;
	description: string | undefined;
	artworkUri: string | undefined;
	trackNumber: string | undefined;
	composer: string | undefined;
	conductor: string | undefined;
	genre: string | undefined;
	compilation: string | undefined;
	station: string | undefined;
	mediaType: string | undefined;
	creationDate: string | undefined;
	creationYear: string | undefined;
};

export type AudioMetadata = AudioCommonMetadata & {
	raw: RawEntry[];
};

export type RawEntry = {
	commonKey: string | undefined;
	keySpace: string | undefined;
	time: number | undefined;
	value: unknown | null;
	key: string;
};
