# Contember Translation Provider

## Installation

`npm install @mangoweb/contember-translation-provider`

## How to use

Install translations plugin to your contember project.

### In `TranslationProvider.tsx`

```jsx
import { ContemberTranslationProvider, useIsError } from '@mangoweb/contember-translation-provider'

// Wrap your app by this component
export const TranslationProvider = () => (
	<ContemberTranslationProvider
		project="__PROJECT__"
		stage="live"
		domain="app"
		initialLanguage="en"
	>
		<YourAppContent />
	</ContemberTranslationProvider>
)

const TranslationProviderInner = (props) => {
	const [loadFailedRetrying, setLoadFailedRetrying] = React.useState(false)
	const isError = useIsError()

	if (isError) {
		return (
			<div>
				<h1>
					Loading translations has failed.
				</h1>
				<button
					onClick={() => {
						setLoadFailedRetrying(true)
						location.reload()
					}}
					disabled={loadFailedRetrying}
				>
					Try again
				</button>
			</div>
		)
	}

	return <>{props.children}</>
```

### In any other component which needs translations

```jsx
import { useTranslate } from '@mangoweb/contember-translation-provider'

export const OtherComponent: React.SFC = () => {
	const translate = useTranslate()

	// const setLanguage = useSetLanguage()
	// const isLoadingInitialLanguage = useIsLoadingInitialLanguage()
	// const isLoadingAnotherLanguage = useIsLoadingAnotherLanguage()
	// const isError = useIsError()
	// const currentLanguage = useCurrentLanguage()
	// const currentVisibleLanguage = useCurrentVisibleLanguage()

	return <div>{translate('greeting.world')}</div>
}
```
