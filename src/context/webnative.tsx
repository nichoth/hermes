// import * as React from "react"
import { FunctionComponent, Component, createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import * as wn from "webnative"
import FileSystem from "webnative/fs/filesystem"
import { Permissions } from "webnative/ucan/permissions"
wn.setup.debug({ enabled: true })

interface WebnativeContext {
    state: wn.State | undefined
    fs: FileSystem | undefined
    username: string | undefined
    error: Error | undefined
    login: () => void
    logout: () => void
}

const WebnativeCtx = createContext<WebnativeContext | null>(null)

interface Props {
    permissions?: Permissions
    loading?: Component
    // children: ComponentChildren
}

// const WebnativeProvider: React.FC<Props> = ({
const WebnativeProvider: FunctionComponent<Props> = ({
    permissions,
    loading,
    children,
}) => {
    const [state, setState] = useState<wn.State>()
    const [error, setError] = useState()
    let fs, username
    
    useEffect(() => {
        async function getState() {
            const result = await wn
            .initialise({
                permissions,
            })
            .catch((err) => {
                setError(err)
                return undefined
            })
            
            setState(result)
        }
        getState()
    }, [permissions])
    
    if (!state) {
        return (loading || (<div>Loading...</div>))
    }
    
    const login = () => {
        wn.redirectToLobby(state.permissions)
    }
    
    const logout = () => {
        wn.leave()
    }
    
    switch (state.scenario) {
        case wn.Scenario.AuthCancelled:
        // User was redirected to lobby,
        // but cancelled the authorisation
        break
        
        case wn.Scenario.AuthSucceeded:
        case wn.Scenario.Continuation:
        fs = state.fs
        username = state.username
        break
    }
    
    return (<WebnativeCtx.Provider
        value={{ state, fs, username, error, login, logout }}
    >
        {children}
    </WebnativeCtx.Provider>)
}
    
const useWebnative = () => useContext(WebnativeCtx) as WebnativeContext

export { WebnativeProvider, useWebnative }
export type { WebnativeContext }
