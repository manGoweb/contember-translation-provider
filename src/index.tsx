import * as React from 'react'

const ContemberTranslationContext = React.createContext({
	// @TODO: add console.warn that these too should never be called without Provider
	translate: (_: string): string => ' ',
	setLanguage: (_: string) => {},
	isLoadingInitialLanguage: true,
	isLoadingAnotherLanguage: false,
	isError: false,
	currentLanguage: '',
	currentVisibleLanguage: '',
})

const TRANSLATIONS_BASE_URL = 'https://translations-gw.mgw.cz/get'

const fetchTranslations = async (
	project: string,
	stage: string,
	domain: string,
	language: string
) => {
	const response = await fetch(
		`${TRANSLATIONS_BASE_URL}/${project}/${stage}/${domain}/${language}`
	)
	const data = await response.json()
	if (typeof data !== 'object' || typeof data.translations !== 'object') {
		throw new Error('Invalid translation data.')
	}
	return data.translations as {
		[key: string]: string
	}
}

export interface ContemberTranslationProviderProps {
	project: string
	stage: string
	domain: string | string[]
	initialLanguage: string
	onCurrentLanguageChange?: (language: string) => void
}

export const ContemberTranslationProvider: React.FunctionComponent<ContemberTranslationProviderProps> = (
	props
) => {
	const [allTranslations, setAllTranslations] = React.useState<{
		[language: string]: {
			[key: string]: string
		}
	}>({})
	const context = React.useContext(ContemberTranslationContext)
	const [isLoadingTranslations, setIsLoadingTranslations] = React.useState(true)
	const [isSomethingWrong, setIsSomethingWrong] = React.useState(false)
	const [currentLanguage, setCurrentLanguage] = React.useState(
		props.initialLanguage
	)
	const [lastLoadedUsedLanguage, setLastLoadedUsedLanguage] = React.useState(
		props.initialLanguage
	)
	const currentVisibleLanguage = lastLoadedUsedLanguage

	const onError = (error: Error) => {
		console.error(error)
		setIsSomethingWrong(true)
	}

	React.useEffect(() => {
		if (typeof props.domain === 'object') {
			onError(new Error('Multiple domains are not supported yet.'))
		} else if (typeof allTranslations[currentLanguage] === 'undefined') {
			setIsLoadingTranslations(true)
			;(async () => {
				try {
					const translations = await fetchTranslations(
						props.project,
						props.stage,
						props.domain as string,
						currentLanguage
					)
					setAllTranslations({
						...allTranslations,
						[currentLanguage]: translations,
					})
					setLastLoadedUsedLanguage(currentLanguage)
				} catch (error) {
					onError(error)
				}
				setIsLoadingTranslations(false)
			})()
		} else {
			setLastLoadedUsedLanguage(currentLanguage)
		}
	}, [currentLanguage])

	const setLanguage = (language: string) => {
		if (props.onCurrentLanguageChange) {
			props.onCurrentLanguageChange(language)
		}
		setCurrentLanguage(language)
	}
	const isLoadingInitialLanguage =
		isLoadingTranslations &&
		typeof allTranslations[props.initialLanguage] === 'undefined'
	const isLoadingAnotherLanguage =
		isLoadingTranslations && !isLoadingInitialLanguage
	const isError = isSomethingWrong

	const translate = (key: string) => {
		if (isLoadingInitialLanguage) {
			return context.translate(key)
		}
		return allTranslations[lastLoadedUsedLanguage][key]
	}

	return (
		<ContemberTranslationContext.Provider
			value={{
				translate,
				setLanguage,
				isLoadingInitialLanguage,
				isLoadingAnotherLanguage,
				isError,
				currentLanguage,
				currentVisibleLanguage,
			}}
		>
			{props.children}
		</ContemberTranslationContext.Provider>
	)
}

export const useTranslate = () =>
	React.useContext(ContemberTranslationContext).translate
export const useSetLanguage = () =>
	React.useContext(ContemberTranslationContext).setLanguage
export const useIsLoadingInitialLanguage = () =>
	React.useContext(ContemberTranslationContext).isLoadingInitialLanguage
export const useIsLoadingAnotherLanguage = () =>
	React.useContext(ContemberTranslationContext).isLoadingAnotherLanguage
export const useIsError = () =>
	React.useContext(ContemberTranslationContext).isError
export const useCurrentLanguage = () =>
	React.useContext(ContemberTranslationContext).currentLanguage
export const useCurrentVisibleLanguage = () =>
	React.useContext(ContemberTranslationContext).currentVisibleLanguage
