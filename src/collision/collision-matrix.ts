
export interface CollisionLayer {
  readonly name: string;
  compareLayer(secondary: string): boolean;
}

class CollisionMatrix {
  private layers: Map<string, Map<string, boolean>> = new Map();

  constructor(layers: string[], matrix: (boolean|number)[][]) {
    // Layer collisions will default to YES (true) unless the name is "DefaultIgnore"
    //
    //                  SampleLayer DefaultIgnore Default
    // Default             YES           NO         YES
    // DefaultIgnore       NO            NO
    // SampleLayer         YES
    for (let j = 0; j < layers.length; j++) {
      const mainLayer = layers[j];
      const mainMap = this.layers.set(mainLayer, new Map()).get(mainLayer)!;

      for (let k = 0; k < layers.length - j; k++) {
        const secondaryLayer = layers[layers.length - k - 1];

        const isIgnored =
          mainLayer === "DefaultIgnore" || secondaryLayer === "DefaultIgnore";
        mainMap.set(
          secondaryLayer,
          !!(matrix[j + k]?.[j] ?? (isIgnored ? false : true))
        );
      }
    }
  }

  /**
   * Get the collision
   *
   * @param {string} main
   * @return {*}  {(CollisionLayer | null)}
   * @memberof CollisionMatrix
   */
  getLayer(main: string): CollisionLayer | null {
    if (this.compareLayer(main, main) == null) {
      return null;
    }

    return {
      name: main,
      compareLayer: (secondary: string) => this.compareLayer(main, secondary)!,
    };
  }

  /**
   * Set the collision state between two layers.
   *
   * @param {string} main
   * @param {string} secondary
   * @param {boolean} state
   * @memberof CollisionMatrix
   */
  setLayer(main: string, secondary: string, state: boolean): void {
    const map = this.layers.get(main) ?? this.layers.get(secondary);

    if (map && map.has(secondary)) {
      map.set(secondary, state);
    }
  }

  /**
   * Returns the collision state between two layers.
   *
   * @param {string} main
   * @param {string} secondary
   * @return {(boolean | null)}
   * @memberof CollisionMatrix
   */
  compareLayer(main: string, secondary: string): boolean | null {
    return (this.layers.get(main)?.has(secondary) || this.layers.get(secondary)?.has(main)) ?? null;
  }
}

export default CollisionMatrix;
