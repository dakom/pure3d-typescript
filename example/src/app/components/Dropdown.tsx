import * as React from "react";
import "./Dropdown.css";

export interface DropdownProps<T> {
  label: string;
  options: Array<T | [T, string]>;
  initialItem?:T;
  onSelectedIndex?: (index: number) => void;
  onSelectedItem?: (T) => void;
}

interface DropdownState { 
  selected?: number, 
  visible: boolean 
}

export class Dropdown<T> extends React.Component<DropdownProps<T>, DropdownState> {
  constructor(props: DropdownProps<T>) {
    super(props);

    const {initialItem, options} = props;
    const state = {visible: false} as DropdownState;
    
    if(initialItem !== undefined) {
      const idx = options.findIndex(option => 
        Array.isArray(option)
          ? option[0] === initialItem
          : option === initialItem
      );

      if(idx !== -1) {
        state.selected = idx;
      }
    }

    if(state.selected !== undefined) {
      if(props.onSelectedIndex) {
        props.onSelectedIndex(state.selected);
      }

      if(props.onSelectedItem) {
        props.onSelectedItem(initialItem);
      }
    }

    this.state = state
  }

  
  render() {
    const { options, onSelectedIndex, onSelectedItem } = this.props;
    const { selected, visible } = this.state;
    const label = selected === undefined ? this.props.label : this.props.options[selected];
    return (
      <div className="dropdown" onMouseOver={evt => this.setState({ visible: true })} onMouseLeave={evt => this.setState({ visible: false })} >
        <button className="dropbtn"  >{label}</button>
        {visible === true &&
          <div className="dropdown-content">
            {options.map((option, index) => {
              const [item, _itemLabel] = Array.isArray(option) ? option : [option, option];

              const itemLabel = typeof _itemLabel === "string" ? _itemLabel : "item " + index.toString();

              const href = `#${itemLabel}`;

              return (
                <a key={index} href={href} onClick={evt => {
                  this.setState({ selected: index, visible: false });
                  if (onSelectedIndex) {
                    onSelectedIndex(index);
                  }
                  if (onSelectedItem) {
                    onSelectedItem(item);
                  }
                }
                }>
                  {itemLabel}
                </a>
              )
            })}
          </div>
        }

      </div>
    )
  }
}