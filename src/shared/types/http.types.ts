export namespace Http {
	export enum Method {
		OPTIONS = "options",
		DELETE = "delete",
		PATCH = "patch",
		POST = "post",
		GET = "get",
		PUT = "put"
	}

	export enum StatusCode {
		NetworkAuthenticationRequired = 511,
		NonAuthoritativeInformation = 203,
		ProxyAuthenticationRequired = 407,
		RequestHeaderFieldsTooLarge = 431,
		UnavailableForLegalReasons = 451,
		HttpVersionNotSupported = 505,
		VariantAlsoNegotiates = 506,
		UnsupportedMediaType = 415,
		PreconditionRequired = 428,
		RangeNotSatisfiable = 416,
		UnprocessableEntity = 422,
		InternalServerError = 500,
		InsufficientStorage = 507,
		SwitchingProtocols = 101,
		PreconditionFailed = 412,
		MisdirectedRequest = 421,
		ServiceUnavailable = 503,
		TemporaryRedirect = 307,
		PermanentRedirect = 308,
		ExpectationFailed = 417,
		MovedPermanently = 301,
		MethodNotAllowed = 405,
		FailedDependency = 424,
		AlreadyReported = 208,
		MultipleChoices = 300,
		PaymentRequired = 402,
		PayloadTooLarge = 413,
		UpgradeRequired = 426,
		TooManyRequests = 429,
		PartialContent = 206,
		RequestTimeout = 408,
		LengthRequired = 411,
		NotImplemented = 501,
		GatewayTimeout = 504,
		NotAcceptable = 406,
		ResetContent = 205,
		Unauthorized = 401,
		LoopDetected = 508,
		MultiStatus = 207,
		NotModified = 304,
		NotExtended = 510,
		Processing = 102,
		EarlyHints = 103,
		BadRequest = 400,
		UriTooLong = 414,
		BadGateway = 502,
		NoContent = 204,
		Forbidden = 403,
		ImATeapot = 418,
		Continue = 100,
		Accepted = 202,
		SeeOther = 303,
		UseProxy = 305,
		NotFound = 404,
		Conflict = 409,
		TooEarly = 425,
		Created = 201,
		ImUsed = 226,
		Unused = 306,
		Locked = 423,
		Found = 302,
		Gone = 410,
		Ok = 200
	}
}