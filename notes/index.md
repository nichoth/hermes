```
Type '({ permissions, loading, children, }: RenderableProps<Props, any>) =>
    Component<{}, {}> | Element'

is not assignable to type 'FunctionComponent<Props>'.

  Type 'Component<{}, {}> | Element' is not assignable to type 'VNode<any> | null'.

    Type 'Component<{}, {}>' is missing the following properties from type 'VNode<any>': type, keyts(2322)
```

----------------

## signals

https://preactjs.com/guide/v10/signals/#local-state-with-signals


> there are many scenarios where components have their own internal state that is specific to that component. Since there is no reason for this state to live as part of the app's global business logic, it should be confined to the component that needs it. In these scenarios, we can create signals as well as computed signals directly within components using the `useSignal()` and `useComputed()` hooks