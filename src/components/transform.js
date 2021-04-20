import Vector2D from '../math/vector2d.js';
import Matrix3x3 from '../math/matrix3x3.js';
import Component from '../core/component.js';

/**
 * Position, rotation and scale of an entity.
 *
 * @class Transform
 * @extends {Component}
 */
class Transform extends Component {
  /**
   * @param {[number, number]} [localPosition]
   * @param {number} [localRotation]
   * @param {[number, number]} [localScale]
   */
  constructor(
    localPosition=[0, 0],
    localRotation=0,
    localScale=[1, 1],
  ) {
    super();

    this.localPosition = new Vector2D(localPosition[0], localPosition[1]);
    this.localRotation = localRotation;
    this.localScale = new Vector2D(localScale[0], localScale[1]);
  }

  /**
   * Position of an entity.
   *
   * @type {Vector2D}
   * @memberOf Transform
   */
  get position() {
    /** @type {Transform} */
    const parent = this._parent;
    return new Proxy(this.localPosition, {
      get(target, p) {
        return parent?.localToWorldMatrix.multiplyVector2(target)[p] ||
        target.clone()[p];
      },
      set(target, p, value) {
        switch (p) {
        case 'x':
          target.x = parent?.localToWorldMatrix
            .multiplyVector2({x: value, y: 0}).x || value;
          break;
        case 'y':
          target.y = parent?.localToWorldMatrix
            .multiplyVector2({x: 0, y: value}).y || value;
          break;
        default:
          target[p] = value;
          break;
        }

        return true;
      },
    });
  }

  /**
   * Position of an entity.
   *
   * @type {Vector2D}
   * @memberOf Transform
   */
  set position(value) {
    const local = this.worldToLocalMatrix.multiplyVector2(value);

    this.localPosition.x = local.x;
    this.localPosition.y = local.y;
  }

  /**
   * Rotation of an entity.
   *
   * @type {number}
   * @memberOf Transform
   */
  get rotation() {
    return this.localRotation + (this._parent?.rotation || 0);
  }

  /**
   * Rotation of an entity.
   *
   * @type {number}
   * @memberOf Transform
   */
  set rotation(value) {
    this.localRotation = value - (this._parent?.rotation || 0);
  }

  /**
   * Scale of an entity.
   *
   * @type {Vector2D}
   * @memberOf Transform
   */
  get scale() {
    const self = this;

    return new Proxy(this.localScale, {
      get(target, p) {
        return Vector2D.scale((self._parent?.scale || Vector2D.one), target)[p];
      },
      set(target, p, value) {
        switch (p) {
        case 'x':
          target.x = value / (self._parent?.scale.x || 1);
          break;
        case 'y':
          target.y = value / (self._parent?.scale.y || 1);
          break;
        default:
          target[p] = value;
          break;
        }

        return true;
      },
    });
  }

  /**
   * Scale of an entity.
   *
   * @type {Vector2D}
   * @memberOf Transform
   */
  set scale(value) {
    const offset = this._parent?.scale || Vector2D.one;

    this.localScale.x = value.x / offset.x;
    this.localScale.y = value.y / offset.y;
  }

  /**
   * Matrix that transforms a point from local space into world space.
   *
   * @readonly
   * @type {Matrix3x3}
   * @memberof Transform
   */
  get localToWorldMatrix() {
    return Matrix3x3.createTRS(this.position, this.rotation, this.scale);
  }

  /**
   * Matrix that transforms a point from world space into local space.
   *
   * @readonly
   * @type {Matrix3x3}
   * @memberOf Transform
   */
  get worldToLocalMatrix() {
    return this.localToWorldMatrix.inverse;
  }
}

Transform.ATTRIBUTES = {
  SINGLE: true,
};

export default Transform;
